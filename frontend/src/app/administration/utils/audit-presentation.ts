import { JournalAudit } from '../models/administration.models';

export interface OptionAudit {
  valeur: string;
  libelle: string;
}

export interface ValeurAuditLisible {
  cle: string;
  libelle: string;
  avant: string;
  apres: string;
  modifiee: boolean;
}

const ACTIONS: Record<string, string> = {
  CREATION: 'Création',
  MODIFICATION: 'Modification',
  MODIFICATION_HABILITATION: 'Modification des droits',
  MODIFICATION_SITUATION: 'Changement de situation',
  DESACTIVATION: 'Désactivation',
  REACTIVATION: 'Réactivation',
  SUPPRESSION: 'Suppression',
  CHANGEMENT: 'Nouvelle affectation',
  RESTITUTION: 'Restitution au parc',
  CLOTURE_AUTOMATIQUE: 'Clôture automatique',
  IMPORT: 'Import Excel',
  AJOUT_RELEVE: 'Ajout d’un kilométrage',
  AJOUT_PIECE_JOINTE: 'Ajout d’une pièce jointe',
  SUPPRESSION_PIECE_JOINTE: 'Retrait d’une pièce jointe',
  GENERATION: 'Génération du document',
  CONSULTATION: 'Consultation du document',
  TELECHARGEMENT: 'Téléchargement du document'
};

const ENTITES: Record<string, string> = {
  MARQUE: 'Marque',
  MODELE: 'Modèle de véhicule',
  SERVICE_PARC: 'Service ou parc',
  CONDUCTEUR: 'Conducteur',
  VEHICULE: 'Véhicule',
  AFFECTATION: 'Affectation',
  ORDRE_MISSION: 'Ordre de mission',
  IMPORT_SITUATION_VEHICULES: 'Situation globale du parc',
  UTILISATEUR_KEYCLOAK: 'Compte utilisateur',
  PROFIL_KEYCLOAK: 'Profil utilisateur'
};

const CHAMPS: Record<string, string> = {
  code: 'Code',
  designation: 'Désignation',
  modeles: 'Modèles',
  nom: 'Nom',
  marqueCode: 'Marque',
  libelle: 'Libellé',
  type: 'Type',
  actif: 'Compte actif',
  matricule: 'Matricule',
  nomComplet: 'Nom complet',
  telephone: 'Téléphone',
  numeroPermis: 'Numéro de permis',
  dateValiditePermis: 'Validité du permis',
  immatriculation: 'Immatriculation',
  vin: 'Numéro VIN',
  marque: 'Marque',
  modele: 'Modèle',
  genre: 'Genre',
  carburant: 'Carburant',
  kilometrageInitial: 'Kilométrage initial',
  kilometrage: 'Kilométrage',
  statut: 'Statut',
  etatGeneral: 'État général',
  date: 'Date du relevé',
  source: 'Source',
  commentaire: 'Commentaire',
  pieceId: 'Référence de la pièce',
  typePiece: 'Type de pièce',
  nomFichier: 'Nom du fichier',
  vehicule: 'Véhicule',
  serviceParc: 'Service ou parc',
  conducteur: 'Conducteur',
  dateDebut: 'Date de début',
  dateFin: 'Date de fin',
  dateFinPrevue: 'Date de fin prévue',
  motif: 'Motif',
  typeMission: 'Type de mission',
  dateRestitution: 'Date de restitution',
  motifRestitution: 'Motif de restitution',
  numero: 'Numéro',
  affectationId: 'Référence de l’affectation',
  nomFichierImport: 'Nom du fichier',
  nombreLignes: 'Lignes analysées',
  nombreCreations: 'Créations',
  nombreMisesAJour: 'Mises à jour',
  nombreLignesIgnorees: 'Lignes ignorées',
  nomUtilisateur: 'Identifiant',
  prenom: 'Prénom',
  email: 'E-mail',
  roles: 'Rôle',
  motDePasseModifie: 'Mot de passe modifié'
};

const VALEURS: Record<string, string> = {
  true: 'Oui',
  false: 'Non',
  admin: 'Administrateur',
  gestionnaire: 'Gestionnaire',
  consultation: 'Consultation',
  ACTIVE: 'Active',
  TERMINEE: 'Terminée',
  DISPONIBLE: 'Disponible',
  AFFECTE: 'Affecté',
  IMMOBILISE: 'Immobilisé',
  EN_MAINTENANCE: 'En maintenance',
  REFORME: 'Réformé',
  INACTIF: 'Inactif',
  BON_ETAT: 'Bon état',
  ETAT_MOYEN: 'État moyen',
  MAUVAIS_ETAT: 'Mauvais état',
  VOITURE_TOURISME: 'Voiture de tourisme',
  FOURGONNETTE_VITREE: 'Fourgonnette vitrée',
  FOURGONNETTE: 'Fourgonnette',
  MINIBUS: 'Minibus',
  UTILITAIRE: 'Utilitaire',
  CYCLOMOTEUR: 'Cyclomoteur',
  DIESEL: 'Diesel',
  ESSENCE: 'Essence',
  HYBRIDE: 'Hybride',
  ELECTRIQUE: 'Électrique',
  MELANGE: 'Mélange',
  SAISIE_MANUELLE: 'Saisie manuelle',
  CONTROLE_PARC: 'Contrôle du parc',
  AUTRE: 'Autre',
  CARTE_GRISE: 'Carte grise',
  ASSURANCE: 'Assurance',
  VISITE_TECHNIQUE: 'Visite technique',
  VIGNETTE: 'Vignette'
};

export const OPTIONS_ACTION_AUDIT: OptionAudit[] =
  Object.entries(ACTIONS).map(([valeur, libelle]) => ({ valeur, libelle }));

export const OPTIONS_ENTITE_AUDIT: OptionAudit[] =
  Object.entries(ENTITES).map(([valeur, libelle]) => ({ valeur, libelle }));

export function libelleActionAudit(action: string): string {
  return ACTIONS[action] ?? humaniser(action);
}

export function libelleEntiteAudit(entite: string): string {
  return ENTITES[entite] ?? humaniser(entite);
}

export function referenceAudit(reference: string): string {
  if (!reference) return 'Sans référence';
  return reference.length > 12 ? `Réf. ${reference.slice(0, 8).toUpperCase()}` : reference;
}

export function valeursAuditLisibles(audit: JournalAudit): ValeurAuditLisible[] {
  const avant = parser(audit.anciennesValeurs);
  const apres = parser(audit.nouvellesValeurs);
  const cles = [...new Set([...Object.keys(avant), ...Object.keys(apres)])];
  return cles.map(cle => {
    const valeurAvant = formaterValeur(avant[cle]);
    const valeurApres = formaterValeur(apres[cle]);
    return {
      cle,
      libelle: CHAMPS[cle] ?? humaniser(cle),
      avant: valeurAvant,
      apres: valeurApres,
      modifiee: valeurAvant !== valeurApres
    };
  }).sort((a, b) => a.libelle.localeCompare(b.libelle, 'fr'));
}

function parser(valeur: string | null): Record<string, unknown> {
  if (!valeur) return {};
  try {
    const resultat = JSON.parse(valeur);
    return resultat && typeof resultat === 'object' && !Array.isArray(resultat)
      ? resultat as Record<string, unknown> : {};
  } catch {
    return { information: valeur };
  }
}

function formaterValeur(valeur: unknown): string {
  if (valeur === null || valeur === undefined || valeur === '') return 'Non renseigné';
  if (Array.isArray(valeur)) return valeur.map(formaterValeur).join(', ');
  if (typeof valeur === 'boolean') return valeur ? 'Oui' : 'Non';
  if (typeof valeur === 'number') return valeur.toLocaleString('fr-FR');
  const texte = String(valeur);
  if (/^\d{4}-\d{2}-\d{2}$/.test(texte)) {
    const [année, mois, jour] = texte.split('-');
    return `${jour}/${mois}/${année}`;
  }
  return VALEURS[texte] ?? texte;
}

function humaniser(valeur: string): string {
  return valeur
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replaceAll('_', ' ')
    .toLocaleLowerCase('fr-FR')
    .replace(/^./, caractère => caractère.toLocaleUpperCase('fr-FR'));
}
