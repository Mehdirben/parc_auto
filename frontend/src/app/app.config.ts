import { ApplicationConfig, inject, provideZoneChangeDetection } from '@angular/core';
import { PreloadAllModules, provideRouter, Routes, withPreloading } from '@angular/router';
import { provideHttpClient, withInterceptors, HttpInterceptorFn } from '@angular/common/http';
import { from, switchMap, catchError, of } from 'rxjs';
import { KEYCLOAK } from './tokens';
import { adminGuard, métierGuard } from './core/auth.guard';

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
  if (!keycloak || !req.url.includes('/api/')) {
    return next(req);
  }

  const attachToken = () => req.clone({
    headers: req.headers.set('Authorization', `Bearer ${keycloak.token ?? ''}`)
  });

  // updateToken(minValidity) refreshes the token if it will expire within
  // the given number of seconds; it resolves with `true` when refreshed.
  return from(keycloak.updateToken(30)).pipe(
    // Recover only the token-refresh operation. Placing catchError after
    // next() would retry failed business requests, including POST requests.
    catchError(() => of(false)),
    switchMap(() => next(attachToken()))
  );
};

const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'dashboard',
    title: 'Tableau de bord - Parc Automobile',
    loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'referentiels/marques',
    canActivate: [métierGuard],
    title: 'Marques - Parc Automobile',
    loadComponent: () => import('./marques/pages/marques/marques.component').then(m => m.MarquesComponent)
  },
  {
    path: 'referentiels/modeles',
    canActivate: [métierGuard],
    title: 'Modèles - Parc Automobile',
    loadComponent: () => import('./modeles/pages/modeles/modeles.component').then(m => m.ModelesComponent)
  },
  { path: 'referentiels/marques-modeles', redirectTo: 'referentiels/marques', pathMatch: 'full' },
  {
    path: 'referentiels/services-parcs',
    canActivate: [métierGuard],
    title: 'Services et parcs - Parc Automobile',
    loadComponent: () => import('./services-parcs/pages/services-parcs/services-parcs.component').then(m => m.ServicesParcsComponent)
  },
  {
    path: 'referentiels/conducteurs',
    canActivate: [métierGuard],
    title: 'Conducteurs - Parc Automobile',
    loadComponent: () => import('./conducteurs/pages/conducteurs/conducteurs.component').then(m => m.ConducteursComponent)
  },
  {
    path: 'vehicules',
    canActivate: [métierGuard],
    title: 'Véhicules - Parc Automobile',
    loadComponent: () => import('./vehicules/pages/vehicules/vehicules.component').then(m => m.VehiculesComponent)
  },
  {
    path: 'affectations',
    canActivate: [métierGuard],
    title: 'Affectations - Parc Automobile',
    loadComponent: () => import('./affectations/pages/affectations/affectations.component').then(m => m.AffectationsComponent)
  },
  {
    path: 'situation-vehicules',
    canActivate: [métierGuard],
    title: 'Situation des véhicules - Parc Automobile',
    loadComponent: () => import('./situation-vehicules/pages/situation-vehicules/situation-vehicules.component').then(m => m.SituationVehiculesComponent)
  },
  {
    path: 'administration',
    canActivate: [adminGuard],
    title: 'Administration - Parc Automobile',
    loadComponent: () => import('./administration/pages/administration/administration.component').then(m => m.AdministrationComponent)
  },
  {
    path: 'acces-refuse',
    title: 'Accès refusé - Parc Automobile',
    loadComponent: () => import('./shared/access-denied/access-denied.component').then(m => m.AccessDeniedComponent)
  },
  { path: '**', redirectTo: 'dashboard' }
];

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    provideHttpClient(withInterceptors([keycloakBearerInterceptor]))
  ]
};
