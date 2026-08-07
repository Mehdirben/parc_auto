import { Affectation } from '../../affectations/models/affectation.models';

export type DashboardAlertTone = 'danger' | 'warning' | 'info' | 'success';
export type FleetSegmentTone =
  'available' | 'assigned' | 'maintenance' | 'immobilized' | 'reformed' | 'inactive';

export interface DashboardAlert {
  label: string;
  description: string;
  value: number | string;
  tone: DashboardAlertTone;
  icon: string;
  route: string;
  queryParams?: Record<string, string>;
}

export interface FleetSegment {
  label: string;
  value: number;
  percentage: number;
  tone: FleetSegmentTone;
}

export type RecentAffectation = Pick<
  Affectation,
  'id' | 'immatriculation' | 'marqueModele' | 'serviceParcLibelle' |
  'conducteurNom' | 'dateDebut' | 'typeMission' | 'ordreMissionDisponible'
>;
