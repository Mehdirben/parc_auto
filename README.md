# Gestion du Parc Automobile — MESRSI

Web application for managing the Moroccan Ministry of Higher Education's
vehicle fleet. Built with **Angular 18** (standalone components), a
**Spring Boot 3.5 / Java 21** REST API, **SQL Server**, and secured by
**Keycloak 24** with a custom branded login theme.

## Project layout

```
.
├── docker-compose.yml        # SQL Server + Spring Boot + Angular/nginx
├── backend/                  # Spring Boot REST API
│   ├── src/main/java/        # Domain, services, REST and security
│   ├── src/main/resources/   # Configuration + Flyway SQL migrations
│   ├── src/test/             # Business-rule tests
│   └── Dockerfile
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

# 2. From the project root, start SQL Server, the API and the frontend
cd ..
docker compose up -d --build
```

The application is then available at <http://localhost:4205>, the API at
<http://localhost:8080>, SQL Server at `localhost:1433`, and Keycloak's admin
console at <http://localhost:8085>. Flyway creates the `marques` and `modeles`
tables automatically when the API starts.

## Partie 1 — Marques et modèles

The first business module provides:

- paginated brand listing and search;
- brand creation, update, consultation and protected deletion;
- single or bulk model entry using `;` as a separator;
- model update and protected deletion;
- case-insensitive uniqueness constraints at API and database levels;
- creation/modification audit fields populated from the Keycloak identity.

REST endpoints are exposed below `/api/v1`:

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `GET` | `/marques` | Search and paginate brands |
| `POST` | `/marques` | Create a brand with optional models |
| `GET` | `/marques/{code}` | Read a brand and its models |
| `PUT` | `/marques/{code}` | Update a brand |
| `DELETE` | `/marques/{code}` | Delete an unused brand |
| `POST` | `/marques/{code}/modeles` | Add one or more models |
| `PUT` | `/modeles/{id}` | Update a model |
| `DELETE` | `/modeles/{id}` | Delete an unused model |

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

### 6. Configure Session & Token Lifespans

To balance enterprise security and data loss prevention:

**Realm settings** → **Sessions** tab:
- **SSO Session Idle:** `30` `Minutes` (or `2` `Hours` if you allow closed tabs to stay logged in up to 2 hours)
- **SSO Session Max:** `10` `Hours` (full workday limit)

**Realm settings** → **Tokens** tab:
- **Access Token Lifespan:** `5` `Minutes` (short-lived tokens for security)
- **Revoke Refresh Token:** `ON` (enables refresh token rotation)

#### Architecture: Session Management & Inactivity Handling

The application uses a hybrid client/server session management model:

| State | Handling Mechanism | Behavior |
| :--- | :--- | :--- |
| **Active User (Tab Open)** | `InactivityService` + `keycloakBearerInterceptor` | Refreshes token on user activity (throttled every 2 min) and before API calls, resetting Keycloak's server idle timer. |
| **Idle User (Tab Open, >30m)** | `InactivityService` + `SessionTimeoutModalComponent` | Shows a warning modal with a 60s countdown. User can click "Rester connecté" to extend, or auto-logouts upon expiration. |
| **Closed Tab / Browser** | Server-side `SSO Session Idle` | Zero refresh requests are sent. Keycloak invalidates the session on the server after 30 minutes. |
| **End of Workday (>10h)** | Server-side `SSO Session Max` | Session expires on Keycloak server regardless of activity, forcing a fresh daily login. |

### 7. Test it

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

The Angular development server proxies `/api` to `http://localhost:8080`.

Start SQL Server with Docker, then run the backend locally:

```bash
docker compose up -d sqlserver sqlserver-init

cd backend
export DB_PASSWORD='the same MSSQL_SA_PASSWORD value used in .env'
mvn spring-boot:run
```

The backend targets Java 21 and requires Maven 3.6.3 or later.

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
