import { ApplicationConfig, inject, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, Routes } from '@angular/router';
import { provideHttpClient, withInterceptors, HttpInterceptorFn } from '@angular/common/http';
import { from, switchMap, catchError } from 'rxjs';
import { KEYCLOAK } from './tokens';
import { métierGuard } from './core/auth.guard';

/**
 * HTTP interceptor that attaches the Keycloak Bearer token to every
 * request targeting the backend API (`/api/...`).
 *
 * The token is refreshed on-the-fly when it is within 30 seconds of
 * expiring, so long-running sessions keep working instead of failing
 * with 401s once the original access token expires.
 */
export const keycloakBearerInterceptor: HttpInterceptorFn = (req, next) => {
  const keycloak = inject(KEYCLOAK);

  // Skip auth header for non-API requests or when Keycloak is unavailable.
  if (!keycloak || !req.url.includes("/api/")) {
    return next(req);
  }

  const attachToken = () =>
    req.clone({
      headers: req.headers.set(
        "Authorization",
        `Bearer ${keycloak.token ?? ""}`,
      ),
    });

  // updateToken(minValidity) refreshes the token if it will expire within
  // the given number of seconds; it resolves with `true` when refreshed.
  return from(keycloak.updateToken(30)).pipe(
    switchMap(() => next(attachToken())),
    // If refresh fails (e.g. network blip), still attempt the request with
    // the current token rather than blocking the whole app.
    catchError(() => next(attachToken())),
  );
};

const routes: Routes = [
  { path: "", redirectTo: "dashboard", pathMatch: "full" },
  {
    path: "dashboard",
    title: "Tableau de bord - Parc Automobile",
    loadComponent: () =>
      import("./dashboard/dashboard.component").then(
        (m) => m.DashboardComponent,
      ),
  },
  { path: '**', redirectTo: 'dashboard' }
];

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([keycloakBearerInterceptor])),
  ],
};
