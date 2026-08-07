import { Inject, Injectable, Optional } from '@angular/core';
import Keycloak from 'keycloak-js';
import { KEYCLOAK, KeycloakTokenParsed } from '../tokens';

@Injectable({ providedIn: 'root' })
export class PermissionService {
  readonly roles: ReadonlySet<string>;
  private readonly authentifié: boolean;

  constructor(@Optional() @Inject(KEYCLOAK) keycloak: Keycloak | null) {
    this.authentifié = !!keycloak?.authenticated;
    const token = (keycloak?.tokenParsed ?? {}) as KeycloakTokenParsed;
    this.roles = new Set([
      ...(token.realm_access?.roles ?? []),
      ...(token.resource_access?.['parc-automobile-frontend']?.roles ?? [])
    ]);
  }

  get estAdmin(): boolean { return this.roles.has('admin'); }
  get peutModifier(): boolean {
    return this.estAdmin || this.roles.has('gestionnaire');
  }
  get peutConsulter(): boolean {
    return this.authentifié;
  }
}
