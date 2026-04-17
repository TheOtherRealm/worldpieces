"""World Pieces — GitHub OAuth authentication router."""
import uuid
import httpx
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import RedirectResponse
from app.config import get_settings
from app.models.schemas import TokenResponse
from app.services.redis_service import json_set, json_get, keys_matching
from app.utils.jwt_utils import create_access_token

router = APIRouter(prefix="/auth", tags=["auth"])
settings = get_settings()


# ── Helpers ───────────────────────────────────────────────────────────────────

async def _find_user_by_provider(provider: str, provider_id: str) -> dict | None:
    keys = await keys_matching("user:*")
    for key in keys:
        user = await json_get(key)
        if user and user.get("provider") == provider and user.get("provider_id") == str(provider_id):
            return user
    return None


async def _upsert_user(
    provider: str,
    provider_id: str,
    email: str,
    name: str,
    github_login: str | None,
    avatar_url: str | None,
    github_access_token: str | None = None,
) -> dict:
    existing = await _find_user_by_provider(provider, provider_id)
    if existing:
        existing["name"] = name
        existing["avatar_url"] = avatar_url
        existing["github_login"] = github_login
        if github_access_token:
            existing["github_access_token"] = github_access_token
        await json_set(f"user:{existing['id']}", ".", existing)
        return existing

    user_id = str(uuid.uuid4())
    user = {
        "id": user_id,
        "email": email,
        "name": name,
        "github_login": github_login,
        "avatar_url": avatar_url,
        "provider": provider,
        "provider_id": str(provider_id),
        "github_access_token": github_access_token,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "is_admin": False,
        "profile": None,
    }
    await json_set(f"user:{user_id}", ".", user)
    return user


def _make_token_response(user: dict) -> dict:
    token = create_access_token({"sub": user["id"]})
    # Strip sensitive fields before returning
    safe_user = {k: v for k, v in user.items() if k != "github_access_token"}
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": safe_user,
    }


# ── GitHub OAuth ──────────────────────────────────────────────────────────────

@router.get("/github/login")
async def github_login():
    """Redirect the user to GitHub's OAuth consent screen (same tab)."""
    params = (
        f"client_id={settings.github_client_id}"
        f"&redirect_uri={settings.github_redirect_uri}"
        f"&scope=read:user%20user:email%20read:org"
    )
    return RedirectResponse(
        f"https://github.com/login/oauth/authorize?{params}"
    )


@router.get("/github/callback")
async def github_callback(code: str):
    """Handle GitHub OAuth callback — exchange code for user info and JWT."""
    async with httpx.AsyncClient() as client:
        token_resp = await client.post(
            "https://github.com/login/oauth/access_token",
            data={
                "client_id": settings.github_client_id,
                "client_secret": settings.github_client_secret,
                "code": code,
            },
            headers={"Accept": "application/json"},
        )
        token_data = token_resp.json()
        access_token = token_data.get("access_token")
        if not access_token:
            raise HTTPException(status_code=400, detail="GitHub token exchange failed")

        headers = {
            "Authorization": f"Bearer {access_token}",
            "Accept": "application/json",
        }
        user_resp = await client.get("https://api.github.com/user", headers=headers)
        gh_user = user_resp.json()

        # Fetch primary verified email if not public
        email = gh_user.get("email")
        if not email:
            emails_resp = await client.get(
                "https://api.github.com/user/emails", headers=headers
            )
            emails = emails_resp.json()
            primary = next(
                (e for e in emails if e.get("primary") and e.get("verified")), None
            )
            email = primary["email"] if primary else f"{gh_user['login']}@github.local"

    user = await _upsert_user(
        provider="github",
        provider_id=str(gh_user["id"]),
        email=email,
        name=gh_user.get("name") or gh_user.get("login", ""),
        github_login=gh_user.get("login"),
        avatar_url=gh_user.get("avatar_url"),
        github_access_token=access_token,
    )
    result = _make_token_response(user)
    # Redirect to frontend within the same tab — no new tab opened
    frontend_url = f"{settings.frontend_url}/auth-callback?token={result['access_token']}"
    return RedirectResponse(frontend_url)


# ── Current user ──────────────────────────────────────────────────────────────

@router.get("/me")
async def get_me(request: Request):
    """Return current user from Bearer token."""
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    token = auth_header[7:]
    from app.utils.jwt_utils import decode_access_token
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = await json_get(f"user:{payload['sub']}")
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    # Strip sensitive fields
    return {k: v for k, v in user.items() if k != "github_access_token"}
