import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { KEYCLOAK, KeycloakTokenParsed } from '../tokens';

const APPLICATION_ROLES = ['admin', 'gestionnaire'];

export const authenticatedGuard: CanActivateFn = (_route, state) => {
  const keycloak = inject(KEYCLOAK);

  if (keycloak?.authenticated) {
    return true;
  }

  void keycloak?.login({ redirectUri: `${window.location.origin}${state.url}` });
  return false;
};

export const métierGuard: CanActivateFn = () => {
  const keycloak = inject(KEYCLOAK);
  const router = inject(Router);

  if (!keycloak?.authenticated) {
    void keycloak?.login({ redirectUri: window.location.href });
    return false;
  }

  const token = (keycloak.tokenParsed ?? {}) as KeycloakTokenParsed;
  const realmRoles = token.realm_access?.roles ?? [];
  const clientRoles = token.resource_access?.['parc-automobile-frontend']?.roles ?? [];
  const roles = new Set([...realmRoles, ...clientRoles]);

  return APPLICATION_ROLES.some(role => roles.has(role))
    ? true
    : router.createUrlTree(['/acces-refuse']);
};
