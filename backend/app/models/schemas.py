"""World Pieces — Pydantic schemas for request/response validation."""
from __future__ import annotations
from typing import Any, Optional, Literal
from pydantic import BaseModel, Field
from datetime import datetime
# ── Disciplines ───────────────────────────────────────────────────────────────
DISCIPLINES = Literal[
    "quantum_physics",
    "biomechanical_engineering",
    "neuroscience",
    "material_science",
    "biophysics",
]
DISCIPLINE_LABELS: dict[str, str] = {
    "quantum_physics": "Quantum Physics",
    "biomechanical_engineering": "Biomechanical Engineering",
    "neuroscience": "Neuroscience",
    "material_science": "Material Science",
    "biophysics": "Biophysics",
}
# ── User ──────────────────────────────────────────────────────────────────────
class UserPublic(BaseModel):
    id: str
    email: str
    name: str
    github_login: Optional[str] = None
    avatar_url: Optional[str] = None
    provider: str
    created_at: str
    is_admin: bool = False
class UserFull(UserPublic):
    profile: Optional[dict] = None
    github_access_token: Optional[str] = None  # never returned to frontend
# ── Profile ───────────────────────────────────────────────────────────────────
class ProfileUpdate(BaseModel):
    bio: Optional[str] = Field(None, max_length=1000)
    working_on: Optional[str] = Field(None, max_length=500)
    website: Optional[str] = None
    location: Optional[str] = None
    skills: Optional[list[str]] = None
class ProfilePublic(BaseModel):
    user_id: str
    user_name: str
    github_login: Optional[str] = None
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    working_on: Optional[str] = None
    website: Optional[str] = None
    location: Optional[str] = None
    skills: list[str] = []
    solved_example_ids: list[str] = []
    contributed_example_ids: list[str] = []
    updated_at: str
# ── Examples (content pages) ──────────────────────────────────────────────────
class ExampleCreate(BaseModel):
    title: str = Field(..., min_length=3, max_length=200)
    discipline: DISCIPLINES
    problem_summary: str = Field(..., min_length=10)
    solution_explanation: str = Field(..., min_length=10)
    python_code: str = Field(..., min_length=10)
    tags: list[str] = []
    difficulty: Literal["beginner", "intermediate", "advanced"] = "intermediate"
    colab_url: Optional[str] = None  # pre-generated Colab link if provided
class ExampleUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=3, max_length=200)
    problem_summary: Optional[str] = None
    solution_explanation: Optional[str] = None
    python_code: Optional[str] = None
    tags: Optional[list[str]] = None
    difficulty: Optional[Literal["beginner", "intermediate", "advanced"]] = None
    colab_url: Optional[str] = None
class ExamplePublic(BaseModel):
    id: str
    title: str
    slug: str
    discipline: str
    discipline_label: str
    problem_summary: str
    solution_explanation: str
    python_code: str
    tags: list[str]
    difficulty: str
    author_id: str
    author_name: str
    author_avatar: Optional[str] = None
    colab_url: Optional[str] = None
    created_at: str
    updated_at: str
    edit_history: list[dict] = []
class ExampleListItem(BaseModel):
    id: str
    title: str
    slug: str
    discipline: str
    discipline_label: str
    tags: list[str]
    difficulty: str
    author_name: str
    created_at: str
    updated_at: str
# ── Bounties ──────────────────────────────────────────────────────────────────
class BountyCreate(BaseModel):
    title: str = Field(..., min_length=5, max_length=200)
    description: str = Field(..., min_length=10)
    discipline: Optional[DISCIPLINES] = None
    example_id: Optional[str] = None  # link to existing example if applicable
    amount_usd: float = Field(..., gt=0, le=10000)
    github_sponsor_username: str = Field(..., description="GitHub username to sponsor")
class BountyUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[Literal["open", "claimed", "completed", "cancelled"]] = None
    claimed_by_user_id: Optional[str] = None
class BountyPublic(BaseModel):
    id: str
    title: str
    description: str
    discipline: Optional[str] = None
    discipline_label: Optional[str] = None
    example_id: Optional[str] = None
    amount_usd: float
    github_sponsor_username: str
    status: str  # "open" | "claimed" | "completed" | "cancelled"
    author_id: str
    author_name: str
    author_avatar: Optional[str] = None
    claimed_by_user_id: Optional[str] = None
    claimed_by_name: Optional[str] = None
    sponsor_url: Optional[str] = None
    created_at: str
    updated_at: str
# ── Auth ──────────────────────────────────────────────────────────────────────
class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserPublic
# ── Search ────────────────────────────────────────────────────────────────────
class ProfileSearchResult(BaseModel):
    user_id: str
    user_name: str
    github_login: Optional[str] = None
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    working_on: Optional[str] = None
    skills: list[str] = []
    solved_count: int = 0
    contributed_count: int = 0
