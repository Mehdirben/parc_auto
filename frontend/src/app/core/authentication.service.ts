import { Inject, Injectable, Optional } from '@angular/core';
import Keycloak from 'keycloak-js';
import { KEYCLOAK } from '../tokens';

@Injectable({ providedIn: 'root' })
export class AuthenticationService {
  constructor(@Optional() @Inject(KEYCLOAK) private readonly keycloak: Keycloak | null) {}

  get authenticated(): boolean {
    return !!this.keycloak?.authenticated;
  }

  login(redirectUri = window.location.origin): void {
    void this.keycloak?.login({ redirectUri });
  }

  logout(redirectUri = window.location.origin): void {
    void this.keycloak?.logout({ redirectUri });
  }

  changePassword(): void {
    void this.keycloak?.login({
      action: 'UPDATE_PASSWORD',
      redirectUri: window.location.href
    });
  }
}
