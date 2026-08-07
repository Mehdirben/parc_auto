import {
  Carburant, EtatGeneral, GenreVehicule, SourceReleve,
  StatutVehicule, TypePieceJointe
} from '../models/vehicule.models';

const STATUTS: Record<StatutVehicule, string> = {
  DISPONIBLE: 'Disponible',
  AFFECTE: 'Affecté',
  IMMOBILISE: 'Immobilisé',
  EN_MAINTENANCE: 'En maintenance',
  REFORME: 'Réformé',
  INACTIF: 'Inactif'
};

const ETATS: Record<EtatGeneral, string> = {
  BON_ETAT: 'Bon état',
  ETAT_MOYEN: 'État moyen',
  MAUVAIS_ETAT: 'Mauvais état'
};

const GENRES: Record<GenreVehicule, string> = {
  VOITURE_TOURISME: 'Voiture de tourisme',
  FOURGONNETTE_VITREE: 'Fourgonnette vitrée',
  FOURGONNETTE: 'Fourgonnette',
  MINIBUS: 'Minibus',
  UTILITAIRE: 'Utilitaire',
  CYCLOMOTEUR: 'Cyclomoteur'
};

const CARBURANTS: Record<Carburant, string> = {
  DIESEL: 'Diesel',
  ESSENCE: 'Essence',
  HYBRIDE: 'Hybride',
  ELECTRIQUE: 'Électrique',
  MELANGE: 'Mélange'
};

const PIECES: Record<TypePieceJointe, string> = {
  CARTE_GRISE: 'Carte grise',
  ASSURANCE: 'Assurance',
  VISITE_TECHNIQUE: 'Visite technique',
  VIGNETTE: 'Vignette',
  AUTRE: 'Autre'
};

const SOURCES: Record<SourceReleve, string> = {
  SAISIE_MANUELLE: 'Saisie manuelle',
  CONTROLE_PARC: 'Contrôle parc',
  AUTRE: 'Autre'
};

export const libelleStatutVehicule = (statut: StatutVehicule): string => STATUTS[statut];
export const libelleEtatVehicule = (etat: EtatGeneral): string => ETATS[etat];
export const libelleGenreVehicule = (genre: GenreVehicule): string => GENRES[genre];
export const libelleCarburantVehicule = (carburant: Carburant): string => CARBURANTS[carburant];
export const libellePieceVehicule = (type: TypePieceJointe): string => PIECES[type];
export const libelleSourceReleve = (source: SourceReleve): string => SOURCES[source];
