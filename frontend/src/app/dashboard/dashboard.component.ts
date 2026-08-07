import { Component, Inject, OnDestroy, OnInit, Optional, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import Keycloak from 'keycloak-js';
import { Observable, catchError, forkJoin, of } from 'rxjs';
import { KEYCLOAK, KeycloakTokenParsed } from '../tokens';
import { AffectationService } from '../affectations/data-access/affectation.service';
import { ConducteurService } from '../conducteurs/data-access/conducteur.service';
import { AuthenticationService } from '../core/authentication.service';
import { ServiceParcService } from '../services-parcs/data-access/service-parc.service';
import { APP_ICONS } from '../shared/icons/app-icons';
import { HeroBannerComponent } from '../shared/ui/hero-banner/hero-banner.component';
import { SummaryCardComponent, SummaryCardTone } from '../shared/ui/summary-card/summary-card.component';
import { nomAffichage } from '../shared/utils/keycloak-identity';
import { VehiculeService } from '../vehicules/data-access/vehicule.service';
import { DashboardAlertsComponent } from './components/dashboard-alerts/dashboard-alerts.component';
import { FleetStatusComponent } from './components/fleet-status/fleet-status.component';
import { RecentAssignmentsComponent } from './components/recent-assignments/recent-assignments.component';
import {
  DashboardAlert, FleetSegment, FleetSegmentTone, RecentAffectation
} from './models/dashboard.models';

interface DashboardMetric {
  label: string;
  value: string | number;
  tone: SummaryCardTone;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-dashboard',
  imports: [
    RouterLink, HeroBannerComponent, SummaryCardComponent,
    DashboardAlertsComponent, FleetStatusComponent, RecentAssignmentsComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {
  private readonly serviceParc = inject(ServiceParcService);
  private readonly vehicules = inject(VehiculeService);
  private readonly conducteurs = inject(ConducteurService);
  private readonly affectations = inject(AffectationService);
  private readonly authentication = inject(AuthenticationService);

  isAuthenticated = false;
  fullName = '';
  loading = false;
  loadingVisible = false;
  erreursChargement = 0;
  dateMiseAJour = '';
  metrics: DashboardMetric[] = this.metricsInitiales();
  fleetTotal: number | string = '—';
  fleetSegments: FleetSegment[] = [];
  alerts: DashboardAlert[] = [];
  recentAssignments: RecentAffectation[] = [];
  readonly refreshIcon = APP_ICONS.refresh;
  private loadingTimer?: ReturnType<typeof setTimeout>;

  constructor(@Optional() @Inject(KEYCLOAK) private readonly keycloak: Keycloak | null) {}

  ngOnInit(): void {
    this.isAuthenticated = !!this.keycloak?.authenticated;
    if (this.keycloak?.tokenParsed) {
      this.fullName = nomAffichage(this.keycloak.tokenParsed as KeycloakTokenParsed);
    }
    if (this.isAuthenticated) this.charger();
  }

  ngOnDestroy(): void {
    if (this.loadingTimer) clearTimeout(this.loadingTimer);
  }

  connexion(): void {
    this.authentication.login();
  }

  charger(): void {
    if (!this.isAuthenticated || this.loading) return;
    this.loading = true;
    if (!this.dateMiseAJour) {
      this.loadingTimer = setTimeout(() => this.loadingVisible = true, 180);
    }
    this.erreursChargement = 0;

    forkJoin({
      vehicules: this.tolérerErreur(this.vehicules.statistiques()),
      conducteurs: this.tolérerErreur(this.conducteurs.statistiques()),
      services: this.tolérerErreur(this.serviceParc.statistiques()),
      affectations: this.tolérerErreur(
        this.affectations.rechercher('', 'ACTIVE', '', 0, 5)),
      missionsÀGénérer: this.tolérerErreur(
        this.affectations.rechercher('', 'ACTIVE', 'A_GENERER', 0, 1))
    }).subscribe(résultat => {
      const véhicules = résultat.vehicules;
      const conducteurs = résultat.conducteurs;
      const services = résultat.services;
      const affectations = résultat.affectations;
      const missionsÀGénérer = résultat.missionsÀGénérer?.totalElements;

      this.metrics = [
        this.metric('Véhicules recensés', véhicules?.total, 'green',
          APP_ICONS.vehicule, '/vehicules'),
        this.metric('Véhicules disponibles', véhicules?.disponibles, 'green',
          APP_ICONS.actif, '/vehicules'),
        this.metric('Affectations actives', affectations?.totalElements, 'gold',
          APP_ICONS.affectation, '/affectations'),
        this.metric('Conducteurs actifs', conducteurs?.actifs, 'blue',
          APP_ICONS.conducteur, '/referentiels/conducteurs'),
        this.metric('Services actifs', services?.actifs, 'slate',
          APP_ICONS.serviceParc, '/referentiels/services-parcs')
      ];

      this.fleetTotal = véhicules?.total ?? '—';
      this.fleetSegments = véhicules ? this.construireSegments(
        véhicules.total,
        [
          ['Disponibles', véhicules.disponibles, 'available'],
          ['Affectés', véhicules.affectes, 'assigned'],
          ['En maintenance', véhicules.enMaintenance, 'maintenance'],
          ['Immobilisés', véhicules.immobilises, 'immobilized'],
          ['Réformés', véhicules.reformes, 'reformed'],
          ['Inactifs', véhicules.inactifs, 'inactive']
        ]
      ) : [];

      this.alerts = [
        this.alerte('Véhicules immobilisés', 'Intervention ou décision requise',
          véhicules?.immobilises, 'danger', APP_ICONS.indisponible, '/vehicules',
          { statut: 'IMMOBILISE' }),
        this.alerte('Véhicules en maintenance', 'Suivi des indisponibilités',
          véhicules?.enMaintenance, 'warning', APP_ICONS.maintenance, '/vehicules',
          { statut: 'EN_MAINTENANCE' }),
        this.alerte('Permis expirés', 'Conducteurs non affectables',
          conducteurs?.permisExpires, 'danger', APP_ICONS.permis,
          '/referentiels/conducteurs', { permis: 'EXPIRE' }),
        this.alerte('Permis à renouveler', 'Échéance dans les 30 jours',
          conducteurs?.permisExpirantBientot, 'warning', APP_ICONS.permis,
          '/referentiels/conducteurs', { permis: 'A_RENOUVELER' }),
        this.alerte('Ordres de mission à générer', 'Affectations de mission éligibles',
          missionsÀGénérer, 'info', APP_ICONS.mission, '/affectations',
          { statut: 'ACTIVE', ordreMission: 'A_GENERER' })
      ];
      this.recentAssignments = affectations?.contenu ?? [];
      this.dateMiseAJour = new Intl.DateTimeFormat('fr-MA', {
        hour: '2-digit', minute: '2-digit'
      }).format(new Date());
      if (this.loadingTimer) clearTimeout(this.loadingTimer);
      this.loadingVisible = false;
      this.loading = false;
    });
  }

  private tolérerErreur<T>(source: Observable<T>): Observable<T | null> {
    return source.pipe(catchError(() => {
      this.erreursChargement++;
      return of(null);
    }));
  }

  private metricsInitiales(): DashboardMetric[] {
    return [
      this.metric('Véhicules recensés', undefined, 'green', APP_ICONS.vehicule, '/vehicules'),
      this.metric('Véhicules disponibles', undefined, 'green', APP_ICONS.actif, '/vehicules'),
      this.metric('Affectations actives', undefined, 'gold', APP_ICONS.affectation, '/affectations'),
      this.metric('Conducteurs actifs', undefined, 'blue', APP_ICONS.conducteur,
        '/referentiels/conducteurs'),
      this.metric('Services actifs', undefined, 'slate', APP_ICONS.serviceParc,
        '/referentiels/services-parcs')
    ];
  }

  private metric(
    label: string, value: number | undefined, tone: SummaryCardTone,
    icon: string, route: string
  ): DashboardMetric {
    return { label, value: value ?? '—', tone, icon, route };
  }

  private alerte(
    label: string, description: string, value: number | undefined,
    tone: DashboardAlert['tone'], icon: string, route: string,
    queryParams?: Record<string, string>
  ): DashboardAlert {
    return {
      label, description, value: value ?? '—',
      tone: value === 0 ? 'success' : tone, icon, route, queryParams
    };
  }

  private construireSegments(
    total: number,
    valeurs: Array<[string, number, FleetSegmentTone]>
  ): FleetSegment[] {
    return valeurs.map(([label, value, tone]) => ({
      label, value, tone,
      percentage: total === 0 ? 0 : Math.round((value / total) * 100)
    }));
  }
}
