"""World Pieces — Bounties router with GitHub Sponsors GraphQL integration."""
import uuid
from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
import httpx
from app.middleware.auth import get_current_user
from app.models.schemas import (
    BountyCreate,
    BountyUpdate,
    BountyPublic,
    DISCIPLINE_LABELS,
)
from app.services.redis_service import (
    json_set,
    json_get,
    json_del,
    keys_matching,
)
from app.config import get_settings

router = APIRouter(prefix="/bounties", tags=["bounties"])
settings = get_settings()

GITHUB_GRAPHQL_URL = "https://api.github.com/graphql"


# ── GitHub Sponsors helpers ───────────────────────────────────────────────────

async def _get_sponsor_url(github_login: str) -> str | None:
    """Return the GitHub Sponsors URL for a given login, or None if not sponsorable."""
    if not settings.github_sponsors_token:
        return f"https://github.com/sponsors/{github_login}"
    query = """
    query($login: String!) {
      user(login: $login) {
        hasSponsorsListing
        sponsorsListing {
          url
        }
      }
    }
    """
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.post(
                GITHUB_GRAPHQL_URL,
                json={"query": query, "variables": {"login": github_login}},
                headers={
                    "Authorization": f"Bearer {settings.github_sponsors_token}",
                    "Content-Type": "application/json",
                },
                timeout=10,
            )
            data = resp.json()
            user_data = data.get("data", {}).get("user", {})
            if user_data and user_data.get("hasSponsorsListing"):
                listing = user_data.get("sponsorsListing") or {}
                return listing.get("url") or f"https://github.com/sponsors/{github_login}"
    except Exception:
        pass
    return f"https://github.com/sponsors/{github_login}"
async def _get_bounty_or_404(bounty_id: str) -> dict:
    bounty = await json_get(f"bounty:{bounty_id}")
    if not bounty:
        raise HTTPException(status_code=404, detail="Bounty not found")
    return bounty
def _make_discipline_label(discipline: str | None) -> str | None:
    if not discipline:
        return None
    return DISCIPLINE_LABELS.get(discipline, discipline.replace("_", " ").title())


# ── List bounties ─────────────────────────────────────────────────────────────

@router.get("/", response_model=list[BountyPublic])
async def list_bounties(
    discipline: Optional[str] = Query(None),
    status_filter: Optional[str] = Query(None, alias="status"),
    example_id: Optional[str] = Query(None),
    limit: int = Query(50, le=200),
    offset: int = Query(0, ge=0),
):
    """List bounties with optional filtering."""
    keys = await keys_matching("bounty:*")
    results = []
    for key in keys:
        b = await json_get(key)
        if not b:
            continue
        if discipline and b.get("discipline") != discipline:
            continue
        if status_filter and b.get("status") != status_filter:
            continue
        if example_id and b.get("example_id") != example_id:
            continue
        results.append(BountyPublic(
            **b,
            discipline_label=_make_discipline_label(b.get("discipline")),
        ))

    results.sort(key=lambda x: x.created_at, reverse=True)
    return results[offset : offset + limit]


# ── Get single bounty ─────────────────────────────────────────────────────────

@router.get("/{bounty_id}", response_model=BountyPublic)
async def get_bounty(bounty_id: str):
    b = await _get_bounty_or_404(bounty_id)
    return BountyPublic(**b, discipline_label=_make_discipline_label(b.get("discipline")))


# ── Create bounty ─────────────────────────────────────────────────────────────

@router.post("/", response_model=BountyPublic, status_code=status.HTTP_201_CREATED)
async def create_bounty(
    payload: BountyCreate,
    current_user: dict = Depends(get_current_user),
):
    """Post a new monetary bounty linked to GitHub Sponsors."""
    bounty_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()

    sponsor_url = await _get_sponsor_url(payload.github_sponsor_username)

    bounty = {
        "id": bounty_id,
        "title": payload.title,
        "description": payload.description,
        "discipline": payload.discipline,
        "example_id": payload.example_id,
        "amount_usd": payload.amount_usd,
        "github_sponsor_username": payload.github_sponsor_username,
        "sponsor_url": sponsor_url,
        "status": "open",
        "author_id": current_user["id"],
        "author_name": current_user["name"],
        "author_avatar": current_user.get("avatar_url"),
        "claimed_by_user_id": None,
        "claimed_by_name": None,
        "created_at": now,
        "updated_at": now,
    }
    await json_set(f"bounty:{bounty_id}", ".", bounty)
    return BountyPublic(**bounty, discipline_label=_make_discipline_label(bounty.get("discipline")))


# ── Update bounty ─────────────────────────────────────────────────────────────

@router.put("/{bounty_id}", response_model=BountyPublic)
async def update_bounty(
    bounty_id: str,
    payload: BountyUpdate,
    current_user: dict = Depends(get_current_user),
):
    """Update a bounty. Only the author or an admin may update."""
    bounty = await _get_bounty_or_404(bounty_id)

    if bounty["author_id"] != current_user["id"] and not current_user.get("is_admin"):
        raise HTTPException(status_code=403, detail="Not authorised to update this bounty")

    update_data = payload.model_dump(exclude_none=True)

    # If claiming, record who claimed it
    if update_data.get("status") == "claimed" and update_data.get("claimed_by_user_id"):
        claimer = await json_get(f"user:{update_data['claimed_by_user_id']}")
        if claimer:
            update_data["claimed_by_name"] = claimer.get("name", "")

    bounty.update(update_data)
    bounty["updated_at"] = datetime.now(timezone.utc).isoformat()
    await json_set(f"bounty:{bounty_id}", ".", bounty)
    return BountyPublic(**bounty, discipline_label=_make_discipline_label(bounty.get("discipline")))


# ── Delete bounty ─────────────────────────────────────────────────────────────

@router.delete("/{bounty_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_bounty(
    bounty_id: str,
    current_user: dict = Depends(get_current_user),
):
    bounty = await _get_bounty_or_404(bounty_id)
    if bounty["author_id"] != current_user["id"] and not current_user.get("is_admin"):
        raise HTTPException(status_code=403, detail="Not authorised to delete this bounty")
    await json_del(f"bounty:{bounty_id}")


# ── GitHub Sponsors: check sponsorable ───────────────────────────────────────

@router.get("/sponsors/check/{github_login}")
async def check_sponsorable(github_login: str):
    """Check if a GitHub user has a Sponsors listing and return their sponsor URL."""
    url = await _get_sponsor_url(github_login)
    return {"github_login": github_login, "sponsor_url": url}
