import { Component, Inject, OnInit, Optional, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import Keycloak from 'keycloak-js';
import { KEYCLOAK, KEYCLOAK_ERROR, KeycloakTokenParsed } from './tokens';
import { InactivityService } from './core/inactivity.service';
import { AuthenticationService } from './core/authentication.service';
import { ToastContainerComponent } from './shared/ui/toast-container/toast-container.component';
import { SessionTimeoutModalComponent } from './shared/ui/session-timeout-modal/session-timeout-modal.component';
import { NavigationItem, SidebarComponent } from './shared/layout/sidebar/sidebar.component';
import { ServiceUnavailableComponent } from './shared/ui/service-unavailable/service-unavailable.component';
import { PermissionService } from './core/permission.service';
import { ToastService } from './core/toast.service';
import { AdministrationService } from './administration/data-access/administration.service';
import {
  EnregistrerUtilisateurPayload, UtilisateurKeycloak
} from './administration/models/administration.models';
import {
  UtilisateurDialogComponent
} from './administration/components/utilisateur-dialog/utilisateur-dialog.component';
import { APP_ICONS } from './shared/icons/app-icons';
import { rolePrincipal } from './shared/models/security.models';
import { nomAffichage } from './shared/utils/keycloak-identity';

@Component({
    selector: 'app-root',
    imports: [
        CommonModule, RouterOutlet, ServiceUnavailableComponent, SessionTimeoutModalComponent,
        SidebarComponent, ToastContainerComponent, UtilisateurDialogComponent
    ],
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  private readonly sidebarCollapsedStorageKey = 'parc-automobile.sidebar-collapsed';
  readonly inactivity = inject(InactivityService);
  readonly permissions = inject(PermissionService);
  private readonly administration = inject(AdministrationService);
  private readonly authentication = inject(AuthenticationService);
  private readonly toast = inject(ToastService);

  isAuthenticated = false;
  keycloakError: unknown = null;

  userInitials = '';
  fullName = '';
  primaryRole = '';
  sidebarOpen = false;
  sidebarCollapsed = false;
  profilOuvert = false;
  profilChargement = false;
  profilErreur = '';
  profilUtilisateur: UtilisateurKeycloak | null = null;

  readonly navigation: NavigationItem[] = [
    { label: 'Tableau de bord', route: '/dashboard', icon: APP_ICONS.dashboard },
    { label: 'Marques', route: '/referentiels/marques', icon: APP_ICONS.marque },
    { label: 'Modèles', route: '/referentiels/modeles', icon: APP_ICONS.modele },
    { label: 'Services et parcs', route: '/referentiels/services-parcs', icon: APP_ICONS.serviceParc },
    { label: 'Conducteurs', route: '/referentiels/conducteurs', icon: APP_ICONS.conducteur },
    { label: 'Véhicules', route: '/vehicules', icon: APP_ICONS.vehicule },
    { label: 'Affectations', route: '/affectations', icon: APP_ICONS.affectation },
    { label: 'Situation du parc', route: '/situation-vehicules', icon: APP_ICONS.situation },
    { label: 'Administration', route: '/administration', icon: APP_ICONS.administration, adminOnly: true }
  ];

  constructor(
    @Optional() @Inject(KEYCLOAK) private readonly keycloak: Keycloak | null,
    @Optional() @Inject(KEYCLOAK_ERROR) error: unknown,
    private readonly router: Router
  ) {
    this.keycloakError = error;
  }

  ngOnInit(): void {
    this.sidebarCollapsed = this.lireEtatSidebar();

    if (!this.keycloak) {
      return;
    }
    this.isAuthenticated = !!this.keycloak.authenticated;
    const token = (this.keycloak.tokenParsed ?? {}) as KeycloakTokenParsed;

    this.fullName = nomAffichage(token);

    const initialsSource = (token.preferred_username ?? this.fullName).trim();
    this.userInitials = (initialsSource.slice(0, 2) || '??').toUpperCase();

    const realmRoles = token.realm_access?.roles ?? [];
    const clientRoles = token.resource_access?.['parc-automobile-frontend']?.roles ?? [];
    const roles = [...realmRoles, ...clientRoles].filter(
      role => !['offline_access', 'uma_authorization', 'default-roles-parc-automobile'].includes(role)
    );
    this.primaryRole = rolePrincipal(roles);

    this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe(() => {
      this.sidebarOpen = false;
    });

    // Start inactivity tracking for authenticated users
    if (this.isAuthenticated) {
      this.inactivity.start();
    }
  }

  get visibleNavigation(): NavigationItem[] {
    return this.navigation.filter(item => !item.adminOnly || this.permissions.estAdmin);
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  modifierEtatSidebar(collapsed: boolean): void {
    this.sidebarCollapsed = collapsed;
    try {
      localStorage.setItem(this.sidebarCollapsedStorageKey, String(collapsed));
    } catch {
      // L'interface reste utilisable si le stockage du navigateur est indisponible.
    }
  }

  logout(): void {
    this.authentication.logout();
  }

  login(): void {
    this.authentication.login();
  }

  manageAccount(): void {
    if (!this.isAuthenticated || this.profilChargement) return;
    this.profilOuvert = true;
    this.profilChargement = true;
    this.profilErreur = '';
    this.administration.profil().subscribe({
      next: profil => {
        this.profilUtilisateur = profil;
        this.profilChargement = false;
      },
      error: erreur => {
        this.profilErreur = erreur.error?.detail
          ?? 'Impossible de charger les informations du profil.';
        this.profilChargement = false;
      }
    });
  }

  enregistrerProfil(payload: EnregistrerUtilisateurPayload): void {
    if (this.profilChargement) return;
    this.profilChargement = true;
    this.profilErreur = '';
    this.administration.modifierProfil({
      prenom: payload.prenom,
      nom: payload.nom,
      email: payload.email
    }).subscribe({
      next: profil => {
        this.profilUtilisateur = profil;
        this.mettreAJourIdentite(profil);
        this.profilChargement = false;
        this.profilOuvert = false;
        this.toast.show('success', 'Profil mis à jour',
          'Vos informations personnelles ont été enregistrées.');
      },
      error: erreur => {
        this.profilErreur = erreur.error?.detail
          ?? 'La modification du profil a échoué.';
        this.profilChargement = false;
      }
    });
  }

  modifierMotDePasse(): void {
    this.profilOuvert = false;
    this.authentication.changePassword();
  }

  reloadPage(): void {
    window.location.reload();
  }

  private mettreAJourIdentite(profil: UtilisateurKeycloak): void {
    this.fullName = `${profil.prenom ?? ''} ${profil.nom ?? ''}`.trim()
      || profil.nomUtilisateur;
    const initiales = [profil.prenom, profil.nom]
      .filter((valeur): valeur is string => !!valeur?.trim())
      .map(valeur => valeur.trim().charAt(0))
      .join('');
    this.userInitials = (initiales || profil.nomUtilisateur.slice(0, 2) || '??')
      .toUpperCase();
  }

  private lireEtatSidebar(): boolean {
    try {
      return localStorage.getItem(this.sidebarCollapsedStorageKey) === 'true';
    } catch {
      return false;
    }
  }
}
