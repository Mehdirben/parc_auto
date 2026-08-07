# Gestion du Parc Automobile

White-label web application for managing an organization's vehicle fleet.
Built with **Angular 19** (standalone components), a
**Spring Boot 3.5 / Java 21** REST API, **SQL Server**, and secured by
**Keycloak 24** with a custom branded login theme.

## Project layout

```
.
├── docker-compose.yml        # SQL Server + Spring Boot + Angular/nginx
├── backend/                  # Spring Boot REST API
│   ├── src/main/java/        # Feature-first Java packages
│   ├── src/main/resources/   # Configuration + Flyway SQL migrations
│   ├── src/test/             # Tests organised by feature
│   └── Dockerfile
├── frontend/                 # Angular 19 SPA
│   ├── src/
│   │   ├── app/
│   │   │   ├── app.component.*       # App shell (sidebar + <router-outlet>)
│   │   │   ├── app.config.ts         # Routes + HTTP interceptor (token refresh)
│   │   │   ├── tokens.ts             # KEYCLOAK / KEYCLOAK_ERROR injection tokens
│   │   │   ├── core/                  # Authentication and singleton app services
│   │   │   ├── shared/                # Cross-feature UI, models, styles and utilities
│   │   │   ├── conducteurs/           # Driver feature
│   │   │   ├── marques/               # Brand feature
│   │   │   ├── modeles/               # Vehicle-model feature
│   │   │   ├── services-parcs/        # Services and shared-fleet feature
│   │   │   ├── vehicules/             # Vehicle feature
│   │   │   ├── affectations/           # Vehicle assignment feature
│   │   │   ├── ordres-mission/          # Assignment mission-document components
│   │   │   ├── situation-vehicules/     # Consolidated fleet and Excel workflows
│   │   │   ├── administration/          # Keycloak users, permissions and audit log
│   │   │   └── dashboard/             # Routed dashboard view
│   │   ├── environments/             # Build-time env config (dev/prod)
│   │   └── main.ts                   # Keycloak init + Angular bootstrap
│   ├── Dockerfile
│   └── nginx.conf                    # SPA fallback + lazy /api reverse proxy
├── keycloak/                 # Keycloak + Postgres docker-compose
│   ├── docker-compose.yml
│   └── .env.example          # Keycloak/Postgres sample configuration
├── theme/                    # Custom Keycloak login theme (mounted into the container)
│   └── login/
└── .env.example              # Main-stack sample configuration
```

## Application architecture

Both applications use a **feature-first** structure. A business feature owns
its API/UI, business logic, persistence/data access and models. Code is moved
to `shared` only when it is genuinely used by multiple features.

### Backend

The base Java package is
`com.parcautomobile`:

```text
parcautomobile/
├── administration/
│   ├── api/                    # Admin-only REST endpoints
│   └── service/                # Keycloak integration and audit queries
├── profil/
│   ├── api/                    # Authenticated user's profile endpoints
│   └── service/                # Keycloak Account API integration
├── audit/
│   ├── domain/
│   ├── repository/
│   └── service/
├── affectation/
│   ├── api/
│   ├── domain/
│   ├── repository/
│   └── service/
├── ordremission/
│   ├── api/
│   ├── domain/
│   ├── repository/
│   └── service/
├── conducteur/
│   ├── api/
│   ├── domain/
│   ├── repository/
│   └── service/
├── marque/
│   ├── api/
│   ├── domain/
│   ├── repository/
│   └── service/
├── modele/
│   ├── api/
│   ├── domain/
│   ├── repository/
│   └── service/
├── serviceparc/
│   ├── api/
│   ├── domain/
│   ├── repository/
│   └── service/
├── situation/
│   ├── api/                   # Consolidated fleet and Excel endpoints
│   └── service/               # SIT.xlsx mapping and import orchestration
├── vehicule/
│   ├── api/
│   ├── domain/
│   ├── repository/
│   └── service/
├── config/                    # Security and auditing configuration
└── shared/
    ├── audit/                 # Shared audit response mapping
    ├── identity/              # Keycloak identity contracts shared by admin/profile
    ├── security/              # Application role constants
    └── text/                  # Shared text normalisation utilities
```

- `api`: REST controllers and request/response DTOs;
- `domain`: entities, value types and business enums;
- `repository`: Spring Data persistence contracts;
- `service`: business use cases and orchestration;
- `shared`: technical building blocks with more than one feature consumer.

Tests mirror the production feature packages under `backend/src/test/java`.

### Frontend

Angular route components are separated from reusable feature components:

```text
app/
├── administration/
│   ├── components/             # Reusable Keycloak user/profile dialog
│   ├── data-access/
│   ├── models/
│   └── pages/
├── conducteurs/
│   ├── data-access/
│   ├── models/
│   └── pages/
├── marques/
│   ├── data-access/
│   ├── models/
│   └── pages/
├── modeles/
│   ├── components/
│   ├── data-access/
│   ├── models/
│   └── pages/
├── services-parcs/
│   ├── data-access/
│   ├── models/
│   └── pages/
├── affectations/
│   ├── components/
│   ├── data-access/
│   ├── models/
│   └── pages/
├── ordres-mission/
│   ├── components/
│   ├── data-access/
│   └── models/
├── situation-vehicules/
│   ├── components/
│   ├── data-access/
│   ├── models/
│   └── pages/
├── vehicules/
│   ├── components/
│   ├── data-access/
│   ├── models/
│   ├── pages/
│   ├── styles/
│   └── utils/
├── core/
└── shared/
    ├── icons/                  # Single source for business SVG icons
    ├── layout/
    ├── models/
    ├── styles/
    ├── ui/
    └── utils/
```

- `pages`: components loaded by the Angular router;
- `components`: reusable components belonging to one feature;
- `data-access`: HTTP services and future feature state management;
- `models`: feature-specific TypeScript types;
- `core`: application-wide singleton infrastructure;
- `shared`: generic UI and utilities reused across features.

List filters, role precedence, business icons and the common summary card are
centralised under `shared`; feature folders keep only business-specific code.
Empty placeholder folders and duplicate presentation components are not kept.

## Prerequisites

- Docker 20+ with the Compose v2 plugin
- Node.js 20.19+ and npm (for local frontend development)
- Java 21 and Maven 3.6.3+ (for local backend development)

## Quick start (Docker)

```bash
# 1. Create the local configuration files and replace the sample passwords
cp .env.example .env
cp keycloak/.env.example keycloak/.env

# 2. Start Keycloak + Postgres
cd keycloak
docker compose up -d

# 3. From the project root, start SQL Server, the API and the frontend
cd ..
docker compose up -d --build
```

Both `.env` files are gitignored. Review their values before starting the
containers, especially `MSSQL_SA_PASSWORD`, `KEYCLOAK_ADMIN_PASSWORD` and
`POSTGRES_PASSWORD`.

The application is then available at <http://localhost:4205>, the API at
<http://localhost:8080>, SQL Server at `localhost:1433`, and Keycloak's admin
console at <http://localhost:8085>. Flyway applies migrations V1 through V6
for brands/models, services/parks, drivers, vehicles, assignments and mission
orders when the API starts. The consolidated SIT import reuses the vehicle and
audit schemas; it therefore does not require a separate duplicate vehicle table.

### Test the database connection with DBeaver

After the SQL Server containers have started, create a new **SQL Server**
connection in DBeaver with these settings:

| Setting | Value |
| :--- | :--- |
| Host | `localhost` |
| Port | the `SQLSERVER_PORT` value from `.env` (default: `1433`) |
| Database/Schema | `parc_automobile` |
| Authentication | SQL Server Authentication |
| Username | `sa` |
| Password | the `MSSQL_SA_PASSWORD` value from `.env` |

Enable **Trust Server Certificate**, then click **Test Connection**. If
DBeaver prompts for the Microsoft SQL Server JDBC driver, allow it to download
the driver. Once the test succeeds, click **Finish** and browse to
`Databases` → `parc_automobile` → `Schemas` → `dbo` → `Tables`.

If DBeaver reports that the connection was refused, start SQL Server and its
database initializer, wait for them to become healthy, and test again:

```bash
docker compose up -d sqlserver sqlserver-init
docker compose ps
```

### Mock data seeder

For a local demo, set `MOCK_DATA_ENABLED=true` in the root `.env` file and
start (or restart) the backend. The opt-in seeder runs after Flyway and adds a
small connected dataset of brands, models, services, drivers, vehicles,
mileage readings, assignments, and a mission order. It is idempotent, so it is
safe to run again. Mock business codes start with `MOCK` and the records are
attributed to `MOCK_SEEDER`.

Keycloak uses `http://localhost:${KEYCLOAK_PORT}` as its canonical issuer.
This must remain identical for browser authentication and backend calls to
the Admin REST API, even though the backend reaches the host through
`host.docker.internal`.

## Business features

The application currently provides:

- a fleet dashboard with operational indicators;
- brand and vehicle-model reference data;
- services/parks and driver management, including status changes;
- vehicle records, mileage readings and attachments;
- vehicle assignments, changes, restitutions and mission-order documents;
- a consolidated vehicle-situation view with Excel template, preview,
  import and export workflows;
- authenticated profile management;
- Keycloak user/role administration and an application audit log;
- role-based access for `admin`, `gestionnaire` and `consultation` users.

### Brand and model endpoints

The brand/model module provides:

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
| `GET` | `/modeles` | Search and paginate models |
| `GET` | `/modeles/{id}` | Read a model |
| `PUT` | `/modeles/{id}` | Update a model |
| `DELETE` | `/modeles/{id}` | Delete an unused model |

Other REST resources are grouped below `/api/v1` under
`/services-parcs`, `/conducteurs`, `/vehicules`, `/affectations`,
`/ordres-mission`, `/situation-vehicules`, `/profil` and
`/administration`.

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

### 4. Create the application realm roles

**Realm roles** → **Create role** → Role name: `admin` → **Create**.
Repeat for `gestionnaire` and `consultation`.

The roles have the following scope:

| Role | Scope |
|------|-------|
| `admin` | Business data, user habilitations and audit log |
| `gestionnaire` | Business data creation and modification |
| `consultation` | Read-only access to business data |

An authenticated user without any application role is treated as
`consultation` by default. This fallback is enforced by both the Angular
interface and the backend: read operations remain available, while all
write operations still require `admin` or `gestionnaire`.

For the in-application user screen, make `admin` a composite role containing
the `realm-management` client roles `manage-users`, `view-users`,
`query-users` and `view-realm`. These permissions are only used by the backend to forward the
connected administrator's bearer token to the
[Keycloak Admin REST API](https://www.keycloak.org/docs-api/latest/rest-api/index.html).
After changing role mappings or composites, sign out and sign in again so the
new access token contains the updated permissions.

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
**Connexion** in the dashboard notice or the sidebar → you land on the
branded login page → after signing in you're redirected back to the dashboard
with your profile and roles populated.


## Local application development

The frontend and backend can run on the host while SQL Server, Keycloak and
Postgres continue to run in Docker.

```bash
cd frontend
npm ci
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

The dev server points at `http://localhost:8085` for Keycloak by default
(see `frontend/src/environments/environment.ts`). Adjust those values if your
Keycloak runs on a different URL/port.

## Build

```bash
cd frontend
npm run build      # production build (swaps in environment.prod.ts)
npm run typecheck  # strict TypeScript check, including unused code
```

Run the complete backend test suite and the production frontend build exactly
as CI/container builds do:

```bash
docker compose --profile test build backend-tests angular-frontend
```

The frontend container uses `npm ci`, so its dependency graph is reproducible
from `package-lock.json`.

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
| `.env`                  | `BACKEND_PORT`            | Host port for the Spring Boot API |
| `.env`                  | `MOCK_DATA_ENABLED`       | Load the idempotent demo dataset (`true`/`false`) |
| `.env`                  | `SQLSERVER_PORT`          | Host port for SQL Server |
| `.env`                  | `MSSQL_SA_PASSWORD`       | SQL Server `sa` password |
| `.env`                  | `KEYCLOAK_PORT`           | Keycloak port used by the backend container |
| `keycloak/.env`         | `KEYCLOAK_PORT`           | Host port for Keycloak        |
| `keycloak/.env`         | `KEYCLOAK_ADMIN`          | Keycloak admin username       |
| `keycloak/.env`         | `KEYCLOAK_ADMIN_PASSWORD` | Keycloak admin password       |
| `keycloak/.env`         | `POSTGRES_DB`             | Postgres database name        |
| `keycloak/.env`         | `POSTGRES_USER`           | Postgres username             |
| `keycloak/.env`         | `POSTGRES_PASSWORD`       | Postgres password             |
| `keycloak/.env`         | `POSTGRES_PORT`           | Host port for Postgres        |

Keep `KEYCLOAK_PORT` identical in both files so the browser-facing issuer and
the backend's Keycloak connection agree.

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
- The SPA uses `onLoad: 'check-sso'`; protected route guards start the
  Keycloak login flow when no active session exists.
