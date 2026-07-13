/**
 * Production environment configuration.
 *
 * Override these values for your deployment environment. The defaults
 * assume the same host's `/auth` reverse proxy points at Keycloak and
 * that Keycloak is served from `http://localhost:8085` on the host.
 */
export const environment = {
  production: true,
  /** Keycloak server base URL reachable from the end-user's browser. */
  keycloakUrl: 'http://localhost:8085',
  /** Keycloak realm name. */
  realm: 'parc-automobile',
  /** Keycloak public client id configured for this SPA. */
  clientId: 'parc-automobile-frontend'
};
