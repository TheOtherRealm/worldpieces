"""World Pieces — User profiles router."""
from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from app.middleware.auth import get_current_user
from app.models.schemas import ProfileUpdate, ProfilePublic, ProfileSearchResult
from app.services.redis_service import (
    json_set,
    json_get,
    json_del,
    keys_matching,
)

router = APIRouter(prefix="/profiles", tags=["profiles"])


def _default_profile(user: dict) -> dict:
    return {
        "user_id": user["id"],
        "user_name": user["name"],
        "github_login": user.get("github_login"),
        "avatar_url": user.get("avatar_url"),
        "bio": None,
        "working_on": None,
        "website": None,
        "location": None,
        "skills": [],
        "solved_example_ids": [],
        "contributed_example_ids": [],
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }


@router.get("/me", response_model=ProfilePublic)
async def get_my_profile(current_user: dict = Depends(get_current_user)):
    profile = await json_get(f"profile:{current_user['id']}")
    if not profile:
        profile = _default_profile(current_user)
        await json_set(f"profile:{current_user['id']}", ".", profile)
    return ProfilePublic(**profile)


@router.put("/me", response_model=ProfilePublic)
async def update_my_profile(
    payload: ProfileUpdate,
    current_user: dict = Depends(get_current_user),
):
    profile = await json_get(f"profile:{current_user['id']}")
    if not profile:
        profile = _default_profile(current_user)

    update_data = payload.model_dump(exclude_none=True)
    profile.update(update_data)
    profile["updated_at"] = datetime.now(timezone.utc).isoformat()
    profile["user_name"] = current_user["name"]
    profile["avatar_url"] = current_user.get("avatar_url")
    profile["github_login"] = current_user.get("github_login")

    await json_set(f"profile:{current_user['id']}", ".", profile)

    user = await json_get(f"user:{current_user['id']}")
    if user:
        user["profile"] = True
        await json_set(f"user:{current_user['id']}", ".", user)

    return ProfilePublic(**profile)


@router.delete("/me", status_code=status.HTTP_204_NO_CONTENT)
async def delete_my_account(current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    await json_del(f"profile:{user_id}")
    await json_del(f"user:{user_id}")


@router.get("/search", response_model=list[ProfileSearchResult])
async def search_profiles(
    q: str = Query("", description="Search query"),
    limit: int = Query(20, le=100),
):
    keys = await keys_matching("profile:*")
    results: list[ProfileSearchResult] = []
    q_lower = q.lower()

    for key in keys:
        profile = await json_get(key)
        if not profile:
            continue
        if q_lower:
            haystack = " ".join(
                filter(None, [
                    profile.get("user_name", ""),
                    profile.get("github_login", ""),
                    profile.get("bio", ""),
                    profile.get("working_on", ""),
                    " ".join(profile.get("skills", [])),
                ])
            ).lower()
            if q_lower not in haystack:
                continue
        results.append(ProfileSearchResult(
            user_id=profile["user_id"],
            user_name=profile.get("user_name", ""),
            github_login=profile.get("github_login"),
            avatar_url=profile.get("avatar_url"),
            bio=profile.get("bio"),
            working_on=profile.get("working_on"),
            skills=profile.get("skills", []),
            solved_count=len(profile.get("solved_example_ids", [])),
            contributed_count=len(profile.get("contributed_example_ids", [])),
        ))

    results.sort(key=lambda x: x.solved_count + x.contributed_count, reverse=True)
    return results[:limit]


@router.get("/{user_id}", response_model=ProfilePublic)
async def get_profile(user_id: str):
    profile = await json_get(f"profile:{user_id}")
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return ProfilePublic(**profile)
