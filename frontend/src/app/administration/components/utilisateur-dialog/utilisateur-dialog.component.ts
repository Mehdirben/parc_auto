
import {
  Component, EventEmitter, Input, OnChanges, Output, SimpleChanges
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  EnregistrerUtilisateurPayload, RoleApplication, UtilisateurKeycloak
} from '../../models/administration.models';
import {
  ROLES_APPLICATION, rolePrincipal
} from '../../../shared/models/security.models';

export type ModeUtilisateurDialog = 'creation' | 'administration' | 'profil';

@Component({
    selector: 'app-utilisateur-dialog',
    imports: [FormsModule],
    templateUrl: './utilisateur-dialog.component.html',
    styleUrls: ['./utilisateur-dialog.component.css']
})
export class UtilisateurDialogComponent implements OnChanges {
  @Input() open = false;
  @Input() mode: ModeUtilisateurDialog = 'administration';
  @Input() utilisateur: UtilisateurKeycloak | null = null;
  @Input() chargement = false;
  @Input() erreur = '';
  @Output() closed = new EventEmitter<void>();
  @Output() submitted = new EventEmitter<EnregistrerUtilisateurPayload>();
  @Output() passwordChangeRequested = new EventEmitter<void>();

  formulaire: EnregistrerUtilisateurPayload = this.formulaireVide();
  erreurValidation = '';

  private readonly libellesRoles: Record<RoleApplication, string> = {
    admin: 'Administrateur',
    gestionnaire: 'Gestionnaire',
    consultation: 'Consultation'
  };
  readonly roles = ROLES_APPLICATION.map(code => ({
    code,
    label: this.libellesRoles[code]
  }));

  ngOnChanges(changes: SimpleChanges): void {
    if ((changes['open']?.currentValue && !changes['open'].previousValue)
        || changes['utilisateur'] || changes['mode']) {
      this.initialiser();
    }
  }

  get estCreation(): boolean {
    return this.mode === 'creation';
  }

  get estProfil(): boolean {
    return this.mode === 'profil';
  }

  get titre(): string {
    if (this.estProfil) return 'Modifier mon profil';
    return this.estCreation ? 'Nouvel utilisateur' : 'Modifier l’utilisateur';
  }

  get libelleRole(): string {
    return this.roles.find(item => item.code === this.formulaire.role)?.label
      ?? 'Consultation';
  }

  enregistrer(): void {
    const payload = {
      ...this.formulaire,
      nomUtilisateur: this.formulaire.nomUtilisateur.trim(),
      prenom: this.formulaire.prenom.trim(),
      nom: this.formulaire.nom.trim(),
      email: this.formulaire.email.trim()
    };
    if (!payload.nomUtilisateur || !payload.prenom || !payload.nom || !payload.email
        || (this.estCreation && payload.motDePasse.length < 8)) {
      this.erreurValidation = this.estCreation
        ? 'Renseignez tous les champs obligatoires et un mot de passe d’au moins 8 caractères.'
        : 'Renseignez tous les champs obligatoires.';
      return;
    }
    this.erreurValidation = '';
    this.submitted.emit(payload);
  }

  private initialiser(): void {
    const utilisateur = this.utilisateur;
    this.formulaire = utilisateur ? {
      nomUtilisateur: utilisateur.nomUtilisateur,
      prenom: utilisateur.prenom ?? '',
      nom: utilisateur.nom ?? '',
      email: utilisateur.email ?? '',
      actif: utilisateur.actif,
      role: rolePrincipal(utilisateur.roles),
      motDePasse: ''
    } : this.formulaireVide();
    this.erreurValidation = '';
  }

  private formulaireVide(): EnregistrerUtilisateurPayload {
    return {
      nomUtilisateur: '', prenom: '', nom: '', email: '',
      actif: true, role: 'consultation', motDePasse: ''
    };
  }
}
