import { Component, Inject, OnInit, Optional } from '@angular/core';
import { CommonModule } from '@angular/common';
import Keycloak from 'keycloak-js';
import { KEYCLOAK, KeycloakTokenParsed } from '../tokens';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  isAuthenticated = false;
  username = 'Utilisateur';
  email = '';
  fullName = '';
  subject = '';
  roles: string[] = [];

  constructor(@Optional() @Inject(KEYCLOAK) private readonly keycloak: Keycloak | null) {}

  ngOnInit(): void {
    this.isAuthenticated = !!this.keycloak?.authenticated;

    if (!this.keycloak?.tokenParsed) {
      return;
    }
    const token = this.keycloak.tokenParsed as KeycloakTokenParsed;

    this.username = token.preferred_username ?? '';
    this.email = token.email ?? '';
    this.subject = token.sub ?? '';

    const given = token.given_name ?? '';
    const family = token.family_name ?? '';
    const computedName = `${given} ${family}`.trim();
    this.fullName = (token.name ?? computedName) || 'Utilisateur';

    const realmRoles = token.realm_access?.roles ?? [];
    const clientRoles = token.resource_access?.['parc-automobile-frontend']?.roles ?? [];
    this.roles = [...realmRoles, ...clientRoles].filter(
      role => !['offline_access', 'uma_authorization', 'default-roles-parc-automobile'].includes(role)
    );
  }
}
