import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ToastService } from '../../../core/toast.service';
import { PermissionService } from '../../../core/permission.service';
import { MarqueService } from '../../../marques/data-access/marque.service';
import { MarqueOption } from '../../../marques/models/marque.models';
import { PageResponse } from '../../../shared/models/api.models';
import { APP_ICONS } from '../../../shared/icons/app-icons';
import { ActivityItem, ActivityTimelineComponent } from '../../../shared/ui/activity-timeline/activity-timeline.component';
import { AuditTrailComponent } from '../../../shared/ui/audit-trail/audit-trail.component';
import { DataTableComponent } from '../../../shared/ui/data-table/data-table.component';
import { DetailModalComponent } from '../../../shared/ui/detail-modal/detail-modal.component';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header.component';
import { PaginationComponent } from '../../../shared/ui/pagination/pagination.component';
import { SearchToolbarComponent } from '../../../shared/ui/search-toolbar/search-toolbar.component';
import { SummaryCardComponent } from '../../../shared/ui/summary-card/summary-card.component';
import { TableActionComponent } from '../../../shared/ui/table-action/table-action.component';
import { TableLoadingComponent } from '../../../shared/ui/table-loading/table-loading.component';
import { InformationNoticeComponent } from '../../../shared/ui/information-notice/information-notice.component';
import { apiErrorMessage } from '../../../shared/utils/api-error';
import { versElementsTimeline } from '../../../shared/utils/audit-timeline';
import { emptyPage } from '../../../shared/utils/empty-page';
import { lierFiltresListe } from '../../../shared/utils/list-filters';
import { VehiculeCreationModalComponent } from '../../components/creation-modal/vehicule-creation-modal.component';
import { VehiculeDocumentsComponent } from '../../components/documents/vehicule-documents.component';
import { VehiculeKilometrageComponent } from '../../components/kilometrage/vehicule-kilometrage.component';
import { VehiculeSituationModalComponent } from '../../components/situation-modal/vehicule-situation-modal.component';
import {
  libelleCarburantVehicule, libelleEtatVehicule,
  libelleGenreVehicule, libelleStatutVehicule
} from '../../utils/vehicule-labels';
import {
  ActionVehicule, AffectationVehicule, Carburant, GenreVehicule, StatutVehicule,
  VehiculeDetail, VehiculeListe, VehiculeStatistiques
} from '../../models/vehicule.models';
import { VehiculeService } from '../../data-access/vehicule.service';
import { OrdreMissionModalComponent } from '../../../ordres-mission/components/ordre-mission-modal/ordre-mission-modal.component';
import { OrdreMissionService } from '../../../ordres-mission/data-access/ordre-mission.service';
import { OrdreMission } from '../../../ordres-mission/models/ordre-mission.models';

type Onglet = 'identification' | 'affectation' | 'documents' | 'kilometrage' | 'historique';

const LIBELLES_ACTIONS: Record<ActionVehicule, string> = {
  CREATION: 'Création',
  MODIFICATION_SITUATION: 'Modification du statut ou de l’état',
  AJOUT_RELEVE: 'Ajout d’un relevé kilométrique',
  AJOUT_PIECE_JOINTE: 'Ajout d’une pièce jointe',
  SUPPRESSION_PIECE_JOINTE: 'Suppression d’une pièce jointe'
};
const STATUTS_FILTRE: StatutVehicule[] = [
  'DISPONIBLE', 'AFFECTE', 'IMMOBILISE', 'EN_MAINTENANCE', 'REFORME', 'INACTIF'
];
const estStatutFiltre = (valeur: string | null): valeur is StatutVehicule =>
  STATUTS_FILTRE.some(statut => statut === valeur);

@Component({
    selector: 'app-vehicules',
    imports: [
        CommonModule, ReactiveFormsModule, RouterLink, ActivityTimelineComponent, AuditTrailComponent,
        DataTableComponent, DetailModalComponent, EmptyStateComponent, PageHeaderComponent,
        PaginationComponent, SearchToolbarComponent, SummaryCardComponent,
        TableActionComponent, TableLoadingComponent, VehiculeCreationModalComponent,
        VehiculeDocumentsComponent, VehiculeKilometrageComponent, VehiculeSituationModalComponent,
        OrdreMissionModalComponent, InformationNoticeComponent
    ],
    templateUrl: './vehicules.component.html',
    styleUrls: [
        '../../../shared/styles/entity-list.css',
        '../../../shared/styles/detail-identity.css',
        '../../styles/vehicule-tabs.css',
        './vehicules.component.css'
    ]
})
export class VehiculesComponent implements OnInit {
  readonly permissions = inject(PermissionService);
  private readonly service = inject(VehiculeService);
  private readonly marquesService = inject(MarqueService);
  private readonly toast = inject(ToastService);
  private readonly ordreMissionService = inject(OrdreMissionService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly route = inject(ActivatedRoute);

  readonly vehiculeIcon = APP_ICONS.vehicule;
  readonly okIcon = APP_ICONS.actif;
  readonly pauseIcon = APP_ICONS.indisponible;
  readonly libelleStatut = libelleStatutVehicule;
  readonly libelleEtat = libelleEtatVehicule;
  readonly libelleGenre = libelleGenreVehicule;
  readonly libelleCarburant = libelleCarburantVehicule;

  readonly recherche = new FormControl('', { nonNullable: true });
  readonly statutFiltre = new FormControl<StatutVehicule | ''>('', { nonNullable: true });
  readonly genreFiltre = new FormControl<GenreVehicule | ''>('', { nonNullable: true });
  readonly carburantFiltre = new FormControl<Carburant | ''>('', { nonNullable: true });
  readonly marqueFiltre = new FormControl('', { nonNullable: true });

  page: PageResponse<VehiculeListe> = emptyPage();
  statistiques: VehiculeStatistiques = {
    total: 0,
    disponibles: 0,
    affectes: 0,
    immobilises: 0,
    enMaintenance: 0,
    reformes: 0,
    inactifs: 0
  };
  marques: MarqueOption[] = [];
  selection: VehiculeDetail | null = null;
  onglet: Onglet = 'identification';
  chargement = true;
  chargementDetail = false;
  erreur = '';
  creationOuverte = false;
  situationOuverte = false;
  ordreMission: OrdreMission | null = null;

  ngOnInit(): void {
    const statut = this.route.snapshot.queryParamMap.get('statut');
    if (estStatutFiltre(statut)) {
      this.statutFiltre.setValue(statut, { emitEvent: false });
    }
    this.charger();
    this.marquesService.listerMarques().subscribe({ next: marques => this.marques = marques });
    lierFiltresListe(this.destroyRef, [
      { control: this.recherche, debounce: 300 },
      { control: this.statutFiltre },
      { control: this.genreFiltre },
      { control: this.carburantFiltre },
      { control: this.marqueFiltre }
    ], () => this.charger(0));
  }

  charger(numeroPage = this.page.page): void {
    this.chargement = true;
    this.erreur = '';
    this.service.rechercher(
      this.recherche.value.trim(),
      this.statutFiltre.value,
      this.genreFiltre.value,
      this.carburantFiltre.value,
      this.marqueFiltre.value,
      numeroPage
    ).subscribe({
      next: page => {
        this.page = page;
        this.chargement = false;
      },
      error: erreur => {
        this.erreur = apiErrorMessage(erreur);
        this.chargement = false;
      }
    });
    this.service.statistiques().subscribe({ next: statistiques => this.statistiques = statistiques });
  }

  consulter(vehicule: VehiculeListe): void {
    this.selection = null;
    this.onglet = 'identification';
    this.chargementDetail = true;
    this.service.consulter(vehicule.code).subscribe({
      next: detail => {
        this.selection = detail;
        this.chargementDetail = false;
      },
      error: erreur => {
        this.chargementDetail = false;
        this.toast.show('error', 'Consultation impossible', apiErrorMessage(erreur));
      }
    });
  }

  apresCreation(): void {
    this.creationOuverte = false;
    this.charger(0);
  }

  apresMiseAJour(detail: VehiculeDetail): void {
    this.selection = detail;
    this.charger(this.page.page);
  }

  apresMiseAJourSituation(detail: VehiculeDetail): void {
    this.situationOuverte = false;
    this.apresMiseAJour(detail);
  }

  ouvrirOrdreMission(affectation: AffectationVehicule): void {
    this.ordreMissionService.obtenirPourAffectation(affectation.id).subscribe({
      next: ordre => this.ordreMission = ordre,
      error: erreur => this.toast.show(
        'error', 'Ordre de mission indisponible', apiErrorMessage(erreur))
    });
  }

  get historique(): ActivityItem[] {
    return versElementsTimeline(
      this.selection?.historique ?? [],
      LIBELLES_ACTIONS,
      action => action === 'SUPPRESSION_PIECE_JOINTE' ? 'red'
        : action === 'MODIFICATION_SITUATION' ? 'gold' : 'green'
    );
  }

  identifier(_index: number, vehicule: VehiculeListe): string {
    return vehicule.code;
  }
}
