"""World Pieces — Users router for account management and settings."""
from fastapi import APIRouter, Depends, HTTPException, status
from app.middleware.auth import get_current_user
from app.models.schemas import UserPublic
from app.services.redis_service import json_get, json_set, keys_matching

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=UserPublic)
async def get_me(current_user: dict = Depends(get_current_user)):
    """Return the current user's account data (no sensitive fields)."""
    return UserPublic(**{k: v for k, v in current_user.items() if k != "github_access_token"})


@router.get("/", response_model=list[UserPublic])
async def list_users(current_user: dict = Depends(get_current_user)):
    """List all users (admin only)."""
    if not current_user.get("is_admin"):
        raise HTTPException(status_code=403, detail="Admin access required")
    keys = await keys_matching("user:*")
    users = []
    for key in keys:
        u = await json_get(key)
        if u:
            users.append(UserPublic(**{k: v for k, v in u.items() if k != "github_access_token"}))
    return users


@router.get("/{user_id}", response_model=UserPublic)
async def get_user(user_id: str, current_user: dict = Depends(get_current_user)):
    user = await json_get(f"user:{user_id}")
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return UserPublic(**{k: v for k, v in user.items() if k != "github_access_token"})


@router.put("/me/admin-toggle", response_model=dict)
async def toggle_admin(current_user: dict = Depends(get_current_user)):
    """Toggle admin status — development helper only. Disable in production."""
    user = await json_get(f"user:{current_user['id']}")
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user["is_admin"] = not user.get("is_admin", False)
    await json_set(f"user:{current_user['id']}", ".", user)
    return {"is_admin": user["is_admin"]}
