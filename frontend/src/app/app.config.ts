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
  {
    path: "referentiels/marques-modeles",
    canActivate: [métierGuard],
    title: "Marques et modèles - Parc Automobile",
    data: {
      title: "Marques et modèles",
      description:
        "Administration du référentiel des constructeurs et de leurs modèles.",
    },    
    loadComponent: () =>
      import("./referentiels/marques-modeles/marques-modeles.component").then(
        (m) => m.MarquesModelesComponent,
      ),
  },
  {
    path: "referentiels/services-parcs",
    canActivate: [métierGuard],
    title: "Services et parcs - Parc Automobile",
    data: {
      title: "Services et parcs",
      description: "Gestion des directions, services et parcs communs.",
    },
    loadComponent: () =>
      import("./referentiels/services-parcs/services-parcs.component").then(
        (m) => m.ServicesParcsComponent,
      ),
  },
  {
    path: "referentiels/conducteurs",
    canActivate: [métierGuard],
    title: "Conducteurs - Parc Automobile",
    data: {
      title: "Conducteurs",
      description: "Référentiel des conducteurs et suivi de leurs permis.",
    },
    // ✅ MODIFICATION ICI : on charge le vrai composant au lieu du placeholder
    loadComponent: () =>
      import("./referentiels/conducteurs/conducteurs.component").then(
        (m) => m.ConducteursComponent,
      ),
  },
  {
    path: "vehicules",
    canActivate: [métierGuard],
    title: "Véhicules - Parc Automobile",
    data: {
      title: "Gestion des véhicules",
      description: "Identification, état et suivi des véhicules du ministère.",
    },
    loadComponent: () =>
      import("./shared/feature-placeholder/feature-placeholder.component").then(
        (m) => m.FeaturePlaceholderComponent,
      ),
  },
  {
    path: "affectations",
    canActivate: [métierGuard],
    title: "Affectations - Parc Automobile",
    data: {
      title: "Affectations",
      description:
        "Affectations actives, changements et historique des mouvements.",
    },
    loadComponent: () =>
      import("./shared/feature-placeholder/feature-placeholder.component").then(
        (m) => m.FeaturePlaceholderComponent,
      ),
  },
  {
    path: "ordres-mission",
    canActivate: [métierGuard],
    title: "Ordres de mission - Parc Automobile",
    data: {
      title: "Ordres de mission",
      description: "Génération et réimpression des documents de mission.",
    },
    loadComponent: () =>
      import("./shared/feature-placeholder/feature-placeholder.component").then(
        (m) => m.FeaturePlaceholderComponent,
      ),
  },
  {
    path: "situation-vehicules",
    canActivate: [métierGuard],
    title: "Situation des véhicules - Parc Automobile",
    data: {
      title: "Situation des véhicules",
      description: "Vue consolidée du parc et opérations Excel.",
    },
    loadComponent: () =>
      import("./shared/feature-placeholder/feature-placeholder.component").then(
        (m) => m.FeaturePlaceholderComponent,
      ),
  },
  {
    path: "administration",
    canActivate: [métierGuard],
    title: "Administration - Parc Automobile",
    data: {
      title: "Administration",
      description: "Habilitations, paramètres et journalisation.",
    },
    loadComponent: () =>
      import("./shared/feature-placeholder/feature-placeholder.component").then(
        (m) => m.FeaturePlaceholderComponent,
      ),
  },
  {
    path: "acces-refuse",
    title: "Accès refusé - Parc Automobile",
    loadComponent: () =>
      import("./shared/access-denied/access-denied.component").then(
        (m) => m.AccessDeniedComponent,
      ),
  },
  { path: "**", redirectTo: "dashboard" },
];

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([keycloakBearerInterceptor])),
  ],
};
