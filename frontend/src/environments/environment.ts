/**
 * Development environment configuration.
 * Values are substituted at build time; for production builds
 * `environment.prod.ts` is swapped in via `fileReplacements` (see angular.json).
 */
export const environment = {
  production: false,
  /** Keycloak server base URL (with scheme, no trailing slash). */
  keycloakUrl: 'http://localhost:8085',
  /** Keycloak realm name. */
  realm: 'parc-automobile',
  /** Keycloak public client id configured for this SPA. */
  clientId: 'parc-automobile-frontend'
};
