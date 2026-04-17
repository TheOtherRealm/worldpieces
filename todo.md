# World Pieces — Project TODO

## Backend
- [x] FastAPI app with CORS and router registration (main.py)
- [x] Redis connection using host=10.0.0.90, username=admin, password from env
- [x] Pydantic v2 schemas for User, Profile, Example, Bounty
- [x] GitHub OAuth 2.0 login/callback/logout router
- [x] JWT creation and verification utilities
- [x] JWT bearer auth middleware (get_current_user, require_admin)
- [x] Examples CRUD router (create, read, update, delete, list by discipline)
- [x] Mark example as solved (adds to user profile)
- [x] Profiles router (get my profile, update, search, get by user ID)
- [x] Bounties router (create, read, update, delete, list with filters)
- [x] GitHub Sponsors GraphQL API integration (fetch sponsor info)
- [x] Users router (get me, delete account)
- [x] RedisJSON service helpers
- [x] requirements.txt with pinned latest versions
- [x] .env.example with all required variables documented
- [x] seed_examples.py with 5 realistic starter examples

## Starter Content (5 disciplines)
- [x] Quantum Physics: Quantum Harmonic Oscillator — Energy Levels and Wave Functions
- [x] Biomechanical Engineering: Inverse Dynamics of the Human Knee During Gait
- [x] Neuroscience: Hodgkin-Huxley Model — Action Potential Generation
- [x] Material Science: Pair Distribution Function of Amorphous Silica
- [x] Biophysics: Protein Folding Thermodynamics — Two-State Model and Chevron Plot

## Frontend (Ionic React 8)
- [x] Ionic React app scaffolded with latest @ionic/react 8.8.3
- [x] Serif font theme (Merriweather + Georgia fallback)
- [x] World Pieces design tokens (navy, teal, cream, gold palette)
- [x] Axios API service with auth token injection
- [x] Zustand auth store (user, token, isAuthenticated, login, logout)
- [x] Discipline constants and badge utilities
- [x] App.tsx with full routing (tabs + nested routes)
- [x] LoginPage with GitHub OAuth button
- [x] AuthCallbackPage (handles GitHub OAuth redirect)
- [x] HomePage with hero section and discipline cards
- [x] DisciplinesPage listing all 5 categories
- [x] DisciplineDetailPage showing examples for a discipline
- [x] ExampleDetailPage (problem summary, solution, code, mark solved)
- [x] ExampleEditorPage (create new + edit existing examples)
- [x] CodeBlock component with syntax highlighting (react-syntax-highlighter)
- [x] VS Code "Open in VS Code" one-click button (vscode:// URI)
- [x] Google Colab "Open in Colab" one-click badge button
- [x] ProfilePage (my profile, bio, working on, solved/contributed lists)
- [x] ProfileSearchPage (search users by name/GitHub login)
- [x] ProfileDetailPage (public view of another user's profile)
- [x] BountiesPage (list open bounties, filter by discipline)
- [x] BountyDetailPage (full bounty info, GitHub Sponsors link, fulfill)
- [x] SettingsPage (account info, GitHub Sponsors, privacy, logout, delete)
- [x] Capacitor config (appId: com.otherrealm.worldpieces)

## Deployment & Configuration
- [x] .gitignore updated (secrets, Ionic build artifacts, .env files)
- [x] backend/.env.example
- [x] frontend_ionic/.env.example
- [x] capacitor.config.ts updated with World Pieces app ID
- [x] README.md with full setup, deployment, and Nginx instructions
- [x] systemd service example for production backend
- [x] Nginx reverse proxy configuration documented

## Pending / Future
- [ ] Push notifications (ntfy.sh or Firebase)
- [ ] Admin panel for content moderation
- [ ] Comment threads on examples
- [ ] Example versioning / diff view
- [ ] Automated CI/CD pipeline (GitHub Actions)
- [ ] Capgo over-the-air updates for mobile
