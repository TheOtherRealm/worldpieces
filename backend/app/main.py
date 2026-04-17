"""World Pieces — FastAPI application entry point."""
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import get_settings
from app.routers import auth, profiles, users
from app.routers.examples import router as examples_router
from app.routers.bounties import router as bounties_router
from app.services.redis_service import close_redis

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    yield
    await close_redis()


app = FastAPI(
    title="World Pieces API",
    description=(
        "Backend API for the World Pieces learning platform — "
        "real-world engineering and physics code examples."
    ),
    version="2.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.frontend_url,
        "http://localhost:8100",
        "http://localhost:3000",
        "http://localhost:5173",
        "capacitor://localhost",
        "ionic://localhost",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(profiles.router)
app.include_router(users.router)
app.include_router(examples_router)
app.include_router(bounties_router)


@app.get("/health", tags=["health"])
async def health_check():
    return {"status": "ok", "app": settings.app_name, "version": "2.0.0"}
