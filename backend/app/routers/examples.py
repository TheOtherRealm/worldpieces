"""World Pieces — Examples (discipline content pages) router."""
import uuid
from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from app.middleware.auth import get_current_user, get_optional_user
from app.models.schemas import (
    ExampleCreate,
    ExampleUpdate,
    ExamplePublic,
    ExampleListItem,
    DISCIPLINE_LABELS,
)
from app.services.redis_service import (
    json_set,
    json_get,
    json_del,
    keys_matching,
)
from slugify import slugify

router = APIRouter(prefix="/examples", tags=["examples"])


# ── Helpers ───────────────────────────────────────────────────────────────────

def _make_discipline_label(discipline: str) -> str:
    return DISCIPLINE_LABELS.get(discipline, discipline.replace("_", " ").title())


async def _get_example_or_404(example_id: str) -> dict:
    example = await json_get(f"example:{example_id}")
    if not example:
        raise HTTPException(status_code=404, detail="Example not found")
    return example


# ── List examples ─────────────────────────────────────────────────────────────

@router.get("/", response_model=list[ExampleListItem])
async def list_examples(
    discipline: Optional[str] = Query(None),
    tag: Optional[str] = Query(None),
    difficulty: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    limit: int = Query(50, le=200),
    offset: int = Query(0, ge=0),
):
    """List all examples with optional filtering."""
    keys = await keys_matching("example:*")
    results = []
    for key in keys:
        ex = await json_get(key)
        if not ex:
            continue
        if discipline and ex.get("discipline") != discipline:
            continue
        if tag and tag not in ex.get("tags", []):
            continue
        if difficulty and ex.get("difficulty") != difficulty:
            continue
        if search:
            q = search.lower()
            haystack = (
                ex.get("title", "").lower()
                + " "
                + " ".join(ex.get("tags", []))
                + " "
                + ex.get("problem_summary", "").lower()
            )
            if q not in haystack:
                continue
        results.append(
            ExampleListItem(
                id=ex["id"],
                title=ex["title"],
                slug=ex["slug"],
                discipline=ex["discipline"],
                discipline_label=_make_discipline_label(ex["discipline"]),
                tags=ex.get("tags", []),
                difficulty=ex.get("difficulty", "intermediate"),
                author_name=ex.get("author_name", ""),
                created_at=ex["created_at"],
                updated_at=ex["updated_at"],
            )
        )
    print('\n',offset,'\n----\n',limit,'\n')
    # Sort by created_at descending
    results.sort(key=lambda x: x.created_at, reverse=True)
    return results[offset : offset+limit]


# ── Get by discipline ─────────────────────────────────────────────────────────

@router.get("/discipline/{discipline}", response_model=list[ExampleListItem])
async def list_by_discipline(discipline: str):
    """Return all examples for a specific discipline."""
    return await list_examples(discipline=discipline)


# ── Get single example ────────────────────────────────────────────────────────

@router.get("/{example_id}", response_model=ExamplePublic)
async def get_example(example_id: str):
    """Retrieve a single example by ID."""
    ex = await _get_example_or_404(example_id)
    return ExamplePublic(
        **ex,
        discipline_label=_make_discipline_label(ex["discipline"]),
    )


# ── Create example ────────────────────────────────────────────────────────────

@router.post("/", response_model=ExamplePublic, status_code=status.HTTP_201_CREATED)
async def create_example(
    payload: ExampleCreate,
    current_user: dict = Depends(get_current_user),
):
    """Create a new example page. Any authenticated user may contribute."""
    example_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    slug_base = slugify(payload.title)

    # Ensure slug uniqueness
    existing_slugs = set()
    for key in await keys_matching("example:*"):
        ex = await json_get(key)
        if ex:
            existing_slugs.add(ex.get("slug", ""))
    slug = slug_base
    counter = 1
    while slug in existing_slugs:
        slug = f"{slug_base}-{counter}"
        counter += 1

    example = {
        "id": example_id,
        "title": payload.title,
        "slug": slug,
        "discipline": payload.discipline,
        "problem_summary": payload.problem_summary,
        "solution_explanation": payload.solution_explanation,
        "python_code": payload.python_code,
        "tags": payload.tags,
        "difficulty": payload.difficulty,
        "colab_url": payload.colab_url,
        "author_id": current_user["id"],
        "author_name": current_user["name"],
        "author_avatar": current_user.get("avatar_url"),
        "created_at": now,
        "updated_at": now,
        "edit_history": [],
    }
    await json_set(f"example:{example_id}", ".", example)

    # Track contribution on profile
    profile = await json_get(f"profile:{current_user['id']}")
    if profile:
        contributed = profile.get("contributed_example_ids", [])
        contributed.append(example_id)
        profile["contributed_example_ids"] = contributed
        await json_set(f"profile:{current_user['id']}", ".", profile)

    return ExamplePublic(
        **example,
        discipline_label=_make_discipline_label(example["discipline"]),
    )


# ── Update example ────────────────────────────────────────────────────────────

@router.put("/{example_id}", response_model=ExamplePublic)
async def update_example(
    example_id: str,
    payload: ExampleUpdate,
    current_user: dict = Depends(get_current_user),
):
    """Update an example. Only the author or an admin may edit."""
    example = await _get_example_or_404(example_id)

    if example["author_id"] != current_user["id"] and not current_user.get("is_admin"):
        raise HTTPException(status_code=403, detail="Not authorised to edit this example")

    now = datetime.now(timezone.utc).isoformat()

    # Record edit history
    history_entry = {
        "editor_id": current_user["id"],
        "editor_name": current_user["name"],
        "edited_at": now,
        "changes": payload.model_dump(exclude_none=True),
    }
    example.setdefault("edit_history", []).append(history_entry)

    update_data = payload.model_dump(exclude_none=True)
    example.update(update_data)
    example["updated_at"] = now

    await json_set(f"example:{example_id}", ".", example)
    return ExamplePublic(
        **example,
        discipline_label=_make_discipline_label(example["discipline"]),
    )


# ── Delete example ────────────────────────────────────────────────────────────

@router.delete("/{example_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_example(
    example_id: str,
    current_user: dict = Depends(get_current_user),
):
    """Delete an example. Only the author or an admin may delete."""
    example = await _get_example_or_404(example_id)

    if example["author_id"] != current_user["id"] and not current_user.get("is_admin"):
        raise HTTPException(status_code=403, detail="Not authorised to delete this example")

    await json_del(f"example:{example_id}")


# ── Mark as solved ────────────────────────────────────────────────────────────

@router.post("/{example_id}/solved", status_code=status.HTTP_200_OK)
async def mark_solved(
    example_id: str,
    current_user: dict = Depends(get_current_user),
):
    """Mark an example as solved by the current user."""
    await _get_example_or_404(example_id)

    profile = await json_get(f"profile:{current_user['id']}")
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found — create a profile first")

    solved = profile.get("solved_example_ids", [])
    if example_id not in solved:
        solved.append(example_id)
        profile["solved_example_ids"] = solved
        profile["updated_at"] = datetime.now(timezone.utc).isoformat()
        await json_set(f"profile:{current_user['id']}", ".", profile)

    return {"message": "Marked as solved", "example_id": example_id}
