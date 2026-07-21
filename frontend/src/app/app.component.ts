import { Component, Inject, OnInit, Optional, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import Keycloak from 'keycloak-js';
import { KEYCLOAK, KEYCLOAK_ERROR, KeycloakTokenParsed } from './tokens';
import { InactivityService } from './core/inactivity.service';
import { ToastContainerComponent } from './shared/ui/toast-container/toast-container.component';
import { SessionTimeoutModalComponent } from './shared/ui/session-timeout-modal/session-timeout-modal.component';
import { NavigationItem, SidebarComponent } from './shared/layout/sidebar/sidebar.component';
import { TopbarComponent } from './shared/layout/topbar/topbar.component';
import { ServiceUnavailableComponent } from './shared/ui/service-unavailable/service-unavailable.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, ServiceUnavailableComponent, SessionTimeoutModalComponent, SidebarComponent, ToastContainerComponent, TopbarComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  readonly inactivity = inject(InactivityService);

  isAuthenticated = false;
  keycloakError: unknown = null;

  /** Display name shown in the header pill. */
  userInitials = '';
  fullName = '';
  primaryRole = '';
  roles: string[] = [];
  sidebarOpen = false;
  sidebarCollapsed = false;

  readonly navigation: NavigationItem[] = [
    { label: 'Tableau de bord', route: '/dashboard', icon: 'M3 13h8V3H3v10Zm0 8h8v-6H3v6Zm10 0h8V11h-8v10Zm0-18v6h8V3h-8Z' },
    { label: 'Marques et modèles', route: '/referentiels/marques-modeles', icon: 'M4 4h7v7H4V4Zm9 0h7v7h-7V4ZM4 13h7v7H4v-7Zm9 0h7v7h-7v-7Z' },
    { label: 'Services et parcs', route: '/referentiels/services-parcs', icon: 'M12 3 2 8v2h20V8L12 3ZM4 12v7H2v2h20v-2h-2v-7h-2v7h-4v-7h-4v7H6v-7H4Z' },
    { label: 'Conducteurs', route: '/referentiels/conducteurs', icon: 'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4Zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4Z' },
    { label: 'Véhicules', route: '/vehicules', icon: 'm18.92 6.01-1.84-3.68A2 2 0 0 0 15.29 1H8.71a2 2 0 0 0-1.79 1.33L5.08 6.01A3 3 0 0 0 3 8.86V17a2 2 0 0 0 2 2h1v2h2v-2h8v2h2v-2h1a2 2 0 0 0 2-2V8.86a3 3 0 0 0-2.08-2.85ZM8.71 3h6.58l1.5 3H7.21l1.5-3ZM7 15a2 2 0 1 1 0-4 2 2 0 0 1 0 4Zm10 0a2 2 0 1 1 0-4 2 2 0 0 1 0 4Z' },
    { label: 'Affectations', route: '/affectations', icon: 'M19 3h-4.18A3 3 0 0 0 9.18 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2Zm-7 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2Zm-2 14-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8Z' },
    { label: 'Ordres de mission', route: '/ordres-mission', icon: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Zm1 17H9v-2h6v2Zm0-4H9v-2h6v2Zm-2-6V3.5L18.5 9H13Z' },
    { label: 'Situation du parc', route: '/situation-vehicules', icon: 'M4 19h16v2H4v-2Zm1-7h3v5H5v-5Zm5-5h3v10h-3V7Zm5 3h3v7h-3v-7Z' },
    { label: 'Administration', route: '/administration', icon: 'M19.14 12.94c.04-.31.06-.63.06-.94s-.02-.63-.07-.94l2.03-1.58-1.92-3.32-2.39.96a7.1 7.1 0 0 0-1.62-.94L14.87 3h-3.84l-.37 3.18c-.59.24-1.13.56-1.62.94l-2.39-.96-1.92 3.32 2.03 1.58c-.05.31-.09.64-.09.94s.03.63.08.94l-2.03 1.58 1.92 3.32 2.39-.96c.5.38 1.03.7 1.62.94l.37 3.18h3.84l.37-3.18c.59-.24 1.13-.56 1.62-.94l2.39.96 1.92-3.32-2.03-1.58ZM13 15.5A3.5 3.5 0 1 1 13 8a3.5 3.5 0 0 1 0 7.5Z', adminOnly: true }
  ];

  constructor(
    @Optional() @Inject(KEYCLOAK) private readonly keycloak: Keycloak | null,
    @Optional() @Inject(KEYCLOAK_ERROR) error: unknown,
    private readonly router: Router
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
    this.roles = roles;

    this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe(() => {
      this.sidebarOpen = false;
    });

    // Start inactivity tracking for authenticated users
    if (this.isAuthenticated) {
      this.inactivity.start();
    }
  }

  get visibleNavigation(): NavigationItem[] {
    return this.navigation.filter(item => !item.adminOnly || this.roles.includes('admin'));
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
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
