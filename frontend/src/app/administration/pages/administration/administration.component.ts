import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { from } from 'rxjs';
import { KEYCLOAK } from '../../../tokens';
import { AdministrationService } from '../../data-access/administration.service';
import {
  EnregistrerUtilisateurPayload, JournalAudit, RoleApplication, UtilisateurKeycloak
} from '../../models/administration.models';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header.component';
import { PaginationComponent } from '../../../shared/ui/pagination/pagination.component';
import { TableLoadingComponent } from '../../../shared/ui/table-loading/table-loading.component';
import { PageResponse } from '../../../shared/models/api.models';
import { rolePrincipal } from '../../../shared/models/security.models';
import { UtilisateurDialogComponent } from '../../components/utilisateur-dialog/utilisateur-dialog.component';
import {
  libelleActionAudit, libelleEntiteAudit, OPTIONS_ACTION_AUDIT,
  OPTIONS_ENTITE_AUDIT, referenceAudit, ValeurAuditLisible, valeursAuditLisibles
} from '../../utils/audit-presentation';

type Onglet = 'utilisateurs' | 'permissions' | 'journal';

@Component({
    selector: 'app-administration',
    imports: [
        CommonModule, FormsModule, PageHeaderComponent, PaginationComponent, TableLoadingComponent,
        UtilisateurDialogComponent
    ],
    templateUrl: './administration.component.html',
    styleUrls: ['./administration.component.css']
})
export class AdministrationComponent implements OnInit {
  private readonly api = inject(AdministrationService);
  private readonly keycloak = inject(KEYCLOAK);

  onglet: Onglet = 'utilisateurs';
  rechercheUtilisateur = '';
  rechercheJournal = '';
  action = '';
  entite = '';
  utilisateurs?: PageResponse<UtilisateurKeycloak>;
  journal?: PageResponse<JournalAudit>;
  chargement = false;
  erreur = '';
  modificationId = '';
  detailAudit?: JournalAudit;
  detailValeurs: ValeurAuditLisible[] = [];
  utilisateurDialogueOuvert = false;
  utilisateurModifie: UtilisateurKeycloak | null = null;
  readonly matrice = [
    { fonction: 'Consulter les données du parc', admin: true, gestionnaire: true, consultation: true },
    { fonction: 'Créer et modifier les données métier', admin: true, gestionnaire: true, consultation: false },
    { fonction: 'Importer la situation du parc', admin: true, gestionnaire: true, consultation: false },
    { fonction: 'Gérer les utilisateurs et habilitations', admin: true, gestionnaire: false, consultation: false },
    { fonction: 'Consulter le journal d’audit', admin: true, gestionnaire: false, consultation: false }
  ];
  readonly actionsAudit = OPTIONS_ACTION_AUDIT;
  readonly entitesAudit = OPTIONS_ENTITE_AUDIT;
  readonly libelleActionAudit = libelleActionAudit;
  readonly libelleEntiteAudit = libelleEntiteAudit;
  readonly referenceAudit = referenceAudit;

  ngOnInit(): void {
    if (!this.keycloak) {
      this.chargerUtilisateurs();
      return;
    }
    from(this.keycloak.updateToken(-1)).subscribe({
      next: () => this.chargerUtilisateurs(),
      error: () => {
        this.erreur = 'La session Keycloak doit être renouvelée. Déconnectez-vous puis reconnectez-vous.';
      }
    });
  }

  changerOnglet(onglet: Onglet): void {
    this.onglet = onglet;
    this.erreur = '';
    if (onglet === 'utilisateurs' && !this.utilisateurs) this.chargerUtilisateurs();
    if (onglet === 'journal' && !this.journal) this.chargerJournal();
  }

  chargerUtilisateurs(page = 0): void {
    this.chargement = true; this.erreur = '';
    this.api.utilisateurs(this.rechercheUtilisateur, page).subscribe({
      next: résultat => { this.utilisateurs = résultat; this.chargement = false; },
      error: erreur => {
        this.erreur = erreur.error?.detail ?? 'Impossible de consulter les utilisateurs Keycloak.';
        this.chargement = false;
      }
    });
  }

  ouvrirCreation(): void {
    this.erreur = '';
    this.utilisateurModifie = null;
    this.utilisateurDialogueOuvert = true;
  }

  ouvrirModification(utilisateur: UtilisateurKeycloak): void {
    this.erreur = '';
    this.utilisateurModifie = utilisateur;
    this.utilisateurDialogueOuvert = true;
  }

  enregistrerUtilisateur(payload: EnregistrerUtilisateurPayload): void {
    if (this.modificationId) return;
    this.modificationId = this.utilisateurModifie?.id ?? 'creation'; this.erreur = '';
    const requête = this.utilisateurModifie
      ? this.api.modifierUtilisateur(this.utilisateurModifie.id, payload)
      : this.api.creerUtilisateur(payload);
    requête.subscribe({
      next: modifié => {
        if (this.utilisateurs) {
          const existe = this.utilisateurs.contenu.some(item => item.id === modifié.id);
          this.utilisateurs.contenu = existe
            ? this.utilisateurs.contenu.map(item => item.id === modifié.id ? modifié : item)
            : [modifié, ...this.utilisateurs.contenu];
          if (!existe) this.utilisateurs.totalElements++;
        }
        this.utilisateurDialogueOuvert = false;
        this.modificationId = '';
      },
      error: erreur => {
        this.erreur = erreur.error?.detail ?? 'La mise à jour de l’habilitation a échoué.';
        this.modificationId = '';
      }
    });
  }

  changerStatut(utilisateur: UtilisateurKeycloak): void {
    const payload: EnregistrerUtilisateurPayload = {
      nomUtilisateur: utilisateur.nomUtilisateur,
      prenom: utilisateur.prenom ?? '',
      nom: utilisateur.nom ?? '',
      email: utilisateur.email ?? '',
      actif: !utilisateur.actif,
      role: this.role(utilisateur),
      motDePasse: ''
    };
    this.modificationId = utilisateur.id;
    this.api.modifierUtilisateur(utilisateur.id, payload).subscribe({
      next: modifié => {
        if (this.utilisateurs) {
          this.utilisateurs.contenu = this.utilisateurs.contenu.map(item =>
            item.id === modifié.id ? modifié : item);
        }
        this.modificationId = '';
      },
      error: erreur => {
        this.erreur = erreur.error?.detail ?? 'Le changement de statut a échoué.';
        this.modificationId = '';
      }
    });
  }

  chargerJournal(page = 0): void {
    this.chargement = true; this.erreur = '';
    this.api.journal(this.rechercheJournal, this.action, this.entite, page).subscribe({
      next: résultat => { this.journal = résultat; this.chargement = false; },
      error: () => { this.erreur = 'Impossible de charger le journal d’audit.'; this.chargement = false; }
    });
  }

  nomComplet(user: UtilisateurKeycloak): string {
    return `${user.prenom ?? ''} ${user.nom ?? ''}`.trim() || user.nomUtilisateur;
  }

  role(user: UtilisateurKeycloak): RoleApplication {
    return rolePrincipal(user.roles);
  }

  ouvrirDetailAudit(item: JournalAudit): void {
    this.detailAudit = item;
    this.detailValeurs = valeursAuditLisibles(item);
  }

}
