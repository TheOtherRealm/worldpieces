# World Pieces
## Architecture
```
world-pieces/
├── backend/                  Python FastAPI + RedisJSON
│   ├── app/
│   │   ├── main.py           FastAPI entry point, CORS, router registration
│   │   ├── config.py         Settings (Redis, OAuth, JWT)
│   │   ├── routers/
│   │   │   ├── auth.py       GitHub OAuth 2.0 login/callback/logout
│   │   │   ├── examples.py   CRUD for discipline examples
│   │   │   ├── profiles.py   User profiles, search, solved tracking
│   │   │   ├── bounties.py   GitHub Sponsors bounty system
│   │   │   └── users.py      Account settings, deletion
│   │   ├── models/
│   │   │   └── schemas.py    Pydantic v2 models
│   │   ├── services/
│   │   │   └── redis_service.py  RedisJSON CRUD helpers
│   │   ├── middleware/
│   │   │   └── auth.py       JWT bearer dependency
│   │   └── utils/
│   │       └── jwt_utils.py  Token creation/verification
│   ├── seed_examples.py      Seeds 5 starter examples into Redis
│   ├── requirements.txt      Pinned Python dependencies
│   └── .env.example          Environment variable template
│
└── frontend/           Ionic React 8 + Capacitor 7
    ├── src/
    │   ├── pages/
    │   │   ├── HomePage.tsx
    │   │   ├── LoginPage.tsx
    │   │   ├── AuthCallbackPage.tsx
    │   │   ├── DisciplinesPage.tsx
    │   │   ├── ProfilePage.tsx
    │   │   ├── ProfileSearchPage.tsx
    │   │   ├── ProfileDetailPage.tsx
    │   │   ├── BountiesPage.tsx
    │   │   ├── BountyDetailPage.tsx
    │   │   ├── SettingsPage.tsx
    │   │   ├── disciplines/
    │   │   │   └── DisciplineDetailPage.tsx
    │   │   └── examples/
    │   │       ├── ExampleDetailPage.tsx
    │   │       └── ExampleEditorPage.tsx
    │   ├── components/
    │   │   └── code/CodeBlock.tsx  Syntax highlighting + VS Code/Colab buttons
    │   ├── services/api.ts         Axios API client
    │   ├── store/authStore.ts      Zustand auth state
    │   ├── utils/disciplines.ts    Discipline constants
    │   └── theme/variables.css     Serif fonts + design tokens
    ├── capacitor.config.ts
    └── .env.example
```

---
## Prerequisites

- Python 3.12+
- Node.js 22 LTS
- Redis Stack (with RedisJSON module) running at `where_ever_your_redis_server_is:6379`
- GitHub OAuth Configuration

---
## Backend Setup
### 1. Create virtual environment and install dependencies

```bash
micromamba create -f environment.yml
micromamba activate worldpieces
pip install -r requirements.txt
cd backend

```

### 2. Configure environment

```bash
cp .env.example .env
nano .env
```

Required values:

| Variable | Description |
|---|---|
| `redis_password` | Password for your Redis server |
| `GITHUB_CLIENT_ID` | From your GitHub OAuth App |
| `GITHUB_CLIENT_SECRET` | From your GitHub OAuth App |
| `JWT_SECRET_KEY` | Random 64-char hex (see below) |
| `GITHUB_SPONSORS_TOKEN` | # Personal Access Token with read:org and read:user scopes Create at: https://github.com/settings/tokens |

Generate a JWT secret:
```bash
python -c "import secrets; print(secrets.token_hex(32))"
```
### 3. Seed starter examples
```bash
python seed_examples.py
```
### 4. Run the development server
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8765 --reload
```
API docs: [http://localhost:8765/docs](http://localhost:8765/docs)

---

## Frontend Setup

### 1. Install dependencies

```bash
cd frontend
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
# Set VITE_API_BASE_URL and VITE_GITHUB_CLIENT_ID
```

### 3. Development (browser)

```bash
ionic serve
```

### 4. Production web build

```bash
ionic build --prod
# Output in: frontend/dist/
```

### 5. Android build

```bash
ionic build --prod
npx cap add android       # first time only
npx cap sync android
npx cap open android      # opens Android Studio
```

### 6. iOS build (macOS only)

```bash
ionic build --prod
npx cap add ios           # first time only
npx cap sync ios
npx cap open ios          # opens Xcode
```

---

---

## Security

- `.env` files are excluded by `.gitignore` — **never commit them**
- JWT tokens expire after 7 days (configurable via `JWT_EXPIRE_MINUTES`)
- GitHub OAuth tokens are never persisted beyond the session
- `GITHUB_SPONSORS_TOKEN` is server-side only, never sent to the frontend
- All Redis keys use namespaced patterns: `user:`, `example:`, `bounty:`, `profile:`

---

## Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Backend | FastAPI | 0.136.0 |
| Database | RedisJSON (redis-py) | 7.0.1 |
| Auth | GitHub OAuth 2.0 + JWT (python-jose) | — |
| Frontend | Ionic React | 8.8.3 |
| State Management | Zustand | 5.x |
| Mobile Runtime | Capacitor | 7.x |
| Code Highlighting | react-syntax-highlighter | 15.x |
| HTTP Client | Axios | 1.x |
| Python | 3.11+ | — |
| Node.js | 22 LTS | — |

