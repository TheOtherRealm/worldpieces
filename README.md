# World Pieces

A cross-platform learning platform for modern engineering techniques grounded in statistics and quantum physics. Users can browse, run, and contribute real-world code examples across five scientific disciplines, post monetary bounties via GitHub Sponsors, and build public profiles tracking their solved problems and contributions.

> **Note:** This repository previously hosted *Other Us*, a social networking app. The `other-us-legacy` branch preserves that codebase. The original NiceGUI version is still live at [https://otherus.otherrealm.org](https://otherus.otherrealm.org).

---

## Disciplines

| Discipline | Description |
|---|---|
| **Quantum Physics** | Wave functions, operators, quantum statistics, QHO, quantum gates |
| **Biomechanical Engineering** | Inverse dynamics, gait analysis, musculoskeletal models |
| **Neuroscience** | Neural dynamics, Hodgkin-Huxley, connectomics, spike sorting |
| **Material Science** | Pair distribution functions, MD simulation, crystallography |
| **Biophysics** | Protein folding, membrane biophysics, single-molecule mechanics |

---

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
└── frontend_ionic/           Ionic React 8 + Capacitor 7
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

- Python 3.11+
- Node.js 22 LTS
- Redis Stack (with RedisJSON module) running at `10.0.0.90:6379`
- A GitHub OAuth App

---

## Backend Setup

### 1. Create virtual environment and install dependencies

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
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
| `GITHUB_SPONSORS_TOKEN` | GitHub PAT with `read:user` scope |

Generate a JWT secret:
```bash
python3 -c "import secrets; print(secrets.token_hex(32))"
```

### 3. Seed starter examples

```bash
python seed_examples.py
```

### 4. Run the development server

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

API docs: [http://localhost:8000/docs](http://localhost:8000/docs)

### 5. Production (systemd)

Create `/etc/systemd/system/worldpieces-backend.service`:

```ini
[Unit]
Description=World Pieces FastAPI Backend
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/opt/world-pieces/backend
EnvironmentFile=/opt/world-pieces/backend/.env
ExecStart=/opt/world-pieces/backend/.venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8000 --workers 4
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now worldpieces-backend
```

---

## Frontend Setup

### 1. Install dependencies

```bash
cd frontend_ionic
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
# Output in: frontend_ionic/dist/
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

## GitHub OAuth App Setup

1. Go to [https://github.com/settings/developers](https://github.com/settings/developers) → **OAuth Apps** → **New OAuth App**
2. Set:
   - **Homepage URL**: `https://your-domain.com`
   - **Authorization callback URL**: `https://your-domain.com/auth/callback`
3. Copy **Client ID** and **Client Secret** into `backend/.env`

---

## Nginx Reverse Proxy

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate     /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    # Serve Ionic frontend
    root /opt/world-pieces/frontend_ionic/dist;
    index index.html;
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy FastAPI backend
    location /api/ {
        proxy_pass         http://127.0.0.1:8000/;
        proxy_set_header   Host              $host;
        proxy_set_header   X-Real-IP         $remote_addr;
        proxy_set_header   X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
    }
}

server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$host$request_uri;
}
```

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

---

## License

MIT
