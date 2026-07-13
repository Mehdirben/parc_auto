import { Component, Inject, OnInit, Optional } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import Keycloak from 'keycloak-js';
import { KEYCLOAK, KEYCLOAK_ERROR, KeycloakTokenParsed } from './tokens';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  isAuthenticated = false;
  keycloakError: unknown = null;

  /** Display name shown in the header pill. */
  userInitials = '';
  fullName = '';
  primaryRole = '';

  constructor(
    @Optional() @Inject(KEYCLOAK) private readonly keycloak: Keycloak | null,
    @Optional() @Inject(KEYCLOAK_ERROR) error: unknown
  ) {
    this.keycloakError = error;
  }

  ngOnInit(): void {
    if (!this.keycloak) {
      return;
    }
    this.isAuthenticated = !!this.keycloak.authenticated;
    const token = (this.keycloak.tokenParsed ?? {}) as KeycloakTokenParsed;

    const given = token.given_name ?? '';
    const family = token.family_name ?? '';
    const computedName = `${given} ${family}`.trim();
    this.fullName = (token.name ?? computedName) || 'Utilisateur';

    const initialsSource = (token.preferred_username ?? this.fullName).trim();
    this.userInitials = (initialsSource.slice(0, 2) || '??').toUpperCase();

    const realmRoles = token.realm_access?.roles ?? [];
    const clientRoles = token.resource_access?.['parc-automobile-frontend']?.roles ?? [];
    const roles = [...realmRoles, ...clientRoles].filter(
      role => !['offline_access', 'uma_authorization', 'default-roles-parc-automobile'].includes(role)
    );
    this.primaryRole = roles[0] ?? '';
  }

  logout(): void {
    this.keycloak?.logout({ redirectUri: window.location.origin });
  }

  login(): void {
    this.keycloak?.login({ redirectUri: window.location.origin });
  }

  manageAccount(): void {
    this.keycloak?.accountManagement();
  }

  reloadPage(): void {
    window.location.reload();
  }
}
