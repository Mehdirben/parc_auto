import { StatutAffectation } from '../../affectations/models/affectation.models';

export interface OrdreMission {
  id: string;
  affectationId: string;
  numero: string;
  conducteur: string;
  conducteurMatricule: string;
  fonction: string;
  typeMission: string;
  motif: string;
  dateAller: string;
  dateRetour: string;
  vehicule: string;
  vehiculeCode: string;
  marqueModele: string;
  serviceParc: string;
  dateEdition: string;
  statutAffectation: StatutAffectation;
  dateCreation: string;
  creePar: string;
}
