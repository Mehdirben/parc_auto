# Gestion du Parc Automobile — MESRSI

Web application for managing the Moroccan Ministry of Higher Education's
vehicle fleet. Built with **Angular 18** (standalone components) on the
front end, secured by **Keycloak 24** (with a custom branded login theme),
and deployed with **Docker Compose** + **nginx**.

## Project layout

```
.
├── docker-compose.yml        # Frontend (Angular + nginx)
├── frontend/                 # Angular 18 SPA
│   ├── src/
│   │   ├── app/
│   │   │   ├── app.component.*       # App shell (header + <router-outlet>)
│   │   │   ├── app.config.ts         # Routes + HTTP interceptor (token refresh)
│   │   │   ├── tokens.ts             # KEYCLOAK / KEYCLOAK_ERROR injection tokens
│   │   │   └── dashboard/            # Routed dashboard view
│   │   ├── environments/             # Build-time env config (dev/prod)
│   │   └── main.ts                   # Keycloak init + Angular bootstrap
│   ├── Dockerfile
│   └── nginx.conf                    # SPA fallback + lazy /api reverse proxy
├── keycloak/                 # Keycloak + Postgres docker-compose
│   └── docker-compose.yml
├── theme/                    # Custom Keycloak login theme (mounted into the container)
│   └── login/
└── .env.example              # Sample env vars for both compose files
```

## Prerequisites

- Docker 20+ with the Compose v2 plugin
- Node.js 20+ and npm (only needed for local development without Docker)

## Quick start (Docker)

```bash
# 1. Start Keycloak + Postgres
cd keycloak
docker compose up -d

# 2. From the project root, start the frontend
cd ..
docker compose up -d --build
```

The application is then available at <http://localhost:4205> and Keycloak's
admin console at <http://localhost:8085>. Use the credentials from
`keycloak/.env`.

## One-time Keycloak configuration

Open <http://localhost:8085> and sign in with the `KEYCLOAK_ADMIN` and
`KEYCLOAK_ADMIN_PASSWORD` values from `keycloak/.env`.

### 1. Create the realm

Top-left dropdown → **Create Realm** → Name: `parc-automobile` → **Create**.

### 2. Create the client

**Clients** → **Create client**.

**General settings:**

| Field                | Value                          |
|----------------------|--------------------------------|
| **Client ID**        | `parc-automobile-frontend`     |
| Name                 | *(optional)*                   |
| Client type          | `OpenID Connect`               |
| Always display in UI | `Off`                          |

Click **Next** → **Capability config:**

| Field                    | Value      |
|--------------------------|------------|
| **Client authentication** | **Off** ← public SPA, must be off |
| Authorization            | `Off`      |
| Standard flow            | **On** (default, needed for browser login) |
| Direct access grants     | `Off`      |
| Service accounts roles   | `Off`      |

Click **Next** → **Login and logout:**

| Field                             | Value                        |
|-----------------------------------|------------------------------|
| **Valid redirect URIs**           | `http://localhost:4205/*`    |
| Valid post logout redirect URIs   | `http://localhost:4205/*`    |
| Web origins                       | `http://localhost:4205`      |

For local Angular development with `npm start`, also add
`http://localhost:4200/*` to the redirect/logout redirect fields and
`http://localhost:4200` to Web origins.

Click **Save**.

> **Common pitfalls:**
> - *Client authentication ON* → Keycloak issues a secret that a browser
>   SPA cannot keep. It must be **OFF**.
> - Missing the trailing `/*` → Keycloak rejects
>   `http://localhost:4205/dashboard` as a redirect target.

### 3. Enable the custom login theme

**Realm settings** → **Themes** tab → **Login theme:** `parc-automobile`
→ **Save**. The theme is mounted into the Keycloak container automatically
from `theme/login/`.

### 4. Create a realm role

**Realm roles** → **Create role** → Role name: `admin` → **Create**.
Repeat for any other role you need (e.g. `gestionnaire`).

### 5. Create a user

**Users** → **Add user**:

- **General:** fill in *Email*, *First name*, *Last name*, and set
  *Email verified* to `On`. Click **Create**.
- **Credentials tab** → **Set password** → type a password → toggle
  *Temporary* **Off** if you don't want a forced change on first login → **Save**.
- **Role mapping tab** → *Assign role* → select `admin` → **Assign**.

Self-registration is intentionally disabled — every account is created by
the administrator in this way.

### 6. Test it

Visit <http://localhost:4205>. The app loads the shell (no redirect). Click
**Connexion** in the header → you land on the branded login page → after
signing in you're redirected back to the dashboard with your profile and
roles populated.


## Local development (without Docker)

```bash
cd frontend
npm install
npm start          # ng serve on http://localhost:4200
```

The dev server points at `http://localhost:8085` for Keycloak by default
(see `src/environments/environment.ts`). Adjust those values if your
Keycloak runs on a different URL/port.

## Build

```bash
cd frontend
npm run build      # production build (swaps in environment.prod.ts)
```

## Environment overrides

Each compose file reads configuration from a `.env` file sitting next to
that compose file. The real `.env` files are gitignored so credentials stay
out of the committed Docker Compose files.

```bash
# Frontend compose, from the project root
cp .env.example .env

# Keycloak compose
cp keycloak/.env.example keycloak/.env
```

| File                    | Variable                  | Description                   |
|-------------------------|---------------------------|-------------------------------|
| `.env`                  | `FRONTEND_PORT`           | Host port for the Angular app |
| `keycloak/.env`         | `KEYCLOAK_PORT`           | Host port for Keycloak        |
| `keycloak/.env`         | `KEYCLOAK_ADMIN`          | Keycloak admin username       |
| `keycloak/.env`         | `KEYCLOAK_ADMIN_PASSWORD` | Keycloak admin password       |
| `keycloak/.env`         | `POSTGRES_DB`             | Postgres database name        |
| `keycloak/.env`         | `POSTGRES_USER`           | Postgres username             |
| `keycloak/.env`         | `POSTGRES_PASSWORD`       | Postgres password             |
| `keycloak/.env`         | `POSTGRES_PORT`           | Host port for Postgres        |

The compose files intentionally use required variable checks such as
`${POSTGRES_PASSWORD:?Set POSTGRES_PASSWORD in keycloak/.env}`. If a value
is missing, Docker Compose exits with a clear message instead of silently
using a password from source control.

## Production notes

- Keycloak runs in **dev mode** (`start-dev`, HTTP only). For production,
  switch the container command to `start --optimized` and terminate TLS
  in front of it.
- Rotate the local `keycloak/.env` credentials before any non-local
  exposure.
- The SPA currently uses `onLoad: 'check-sso'` in `frontend/src/main.ts`
  so the UI can be previewed without forcing a redirect. **For production,
  flip it back to `'login-required'`** so every visitor must authenticate
  before reaching the app.
