import { InjectionToken } from '@angular/core';
import Keycloak from 'keycloak-js';

/**
 * Shape of the decoded Keycloak access token (JWT payload).
 * All fields are optional because Keycloak only populates the
 * scopes/claims that the client/realm is configured to emit.
 */
export interface KeycloakTokenParsed {
  sub?: string;
  preferred_username?: string;
  email?: string;
  name?: string;
  given_name?: string;
  family_name?: string;
  realm_access?: { roles?: string[] };
  resource_access?: Record<string, { roles?: string[] }>;
  [claim: string]: unknown;
}

/** The successfully-initialized Keycloak instance (null when init failed). */
export const KEYCLOAK = new InjectionToken<Keycloak | null>('KEYCLOAK_INSTANCE');

/** Error captured when Keycloak failed to initialize, if any. */
export const KEYCLOAK_ERROR = new InjectionToken<unknown>('KEYCLOAK_ERROR');
