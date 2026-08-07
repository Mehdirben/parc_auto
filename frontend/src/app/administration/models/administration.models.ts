import type { RoleApplication } from '../../shared/models/security.models';
export type { RoleApplication } from '../../shared/models/security.models';

export interface UtilisateurKeycloak {
  id: string;
  nomUtilisateur: string;
  prenom: string | null;
  nom: string | null;
  email: string | null;
  actif: boolean;
  roles: string[];
}

export interface EnregistrerUtilisateurPayload {
  nomUtilisateur: string;
  prenom: string;
  nom: string;
  email: string;
  actif: boolean;
  role: RoleApplication;
  motDePasse: string;
}

export interface JournalAudit {
  id: string;
  utilisateur: string | null;
  dateAction: string;
  action: string;
  entite: string;
  entiteId: string;
  anciennesValeurs: string | null;
  nouvellesValeurs: string | null;
  adresseIp: string;
  resultat: 'SUCCES' | 'ECHEC';
}
