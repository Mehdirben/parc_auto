import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ToastService } from '../../../core/toast.service';
import { PermissionService } from '../../../core/permission.service';
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
import { apiErrorMessage } from '../../../shared/utils/api-error';
import { emptyPage } from '../../../shared/utils/empty-page';
import { lierFiltresListe } from '../../../shared/utils/list-filters';
import { AffectationFormModalComponent } from '../../components/affectation-form-modal/affectation-form-modal.component';
import { RestitutionModalComponent } from '../../components/restitution-modal/restitution-modal.component';
import { AffectationService } from '../../data-access/affectation.service';
import {
  Affectation, AffectationDetail, AffectationOptions, AffectationPayload,
  FiltreOrdreMission, StatutAffectation
} from '../../models/affectation.models';
import { OrdreMissionModalComponent } from '../../../ordres-mission/components/ordre-mission-modal/ordre-mission-modal.component';
import { OrdreMissionService } from '../../../ordres-mission/data-access/ordre-mission.service';
import { OrdreMission } from '../../../ordres-mission/models/ordre-mission.models';

@Component({
    selector: 'app-affectations',
    imports: [
        CommonModule, ReactiveFormsModule, ActivityTimelineComponent, AuditTrailComponent,
        DataTableComponent, DetailModalComponent, EmptyStateComponent, PageHeaderComponent,
        PaginationComponent, SearchToolbarComponent, SummaryCardComponent, TableActionComponent,
        TableLoadingComponent, AffectationFormModalComponent, RestitutionModalComponent,
        OrdreMissionModalComponent
    ],
    templateUrl: './affectations.component.html',
    styleUrls: [
        '../../../shared/styles/entity-list.css',
        '../../../shared/styles/detail-identity.css',
        './affectations.component.css'
    ]
})
export class AffectationsComponent implements OnInit {
  readonly permissions = inject(PermissionService);
  private readonly service = inject(AffectationService);
  private readonly toast = inject(ToastService);
  private readonly ordreMissionService = inject(OrdreMissionService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly route = inject(ActivatedRoute);

  readonly affectationIcon = APP_ICONS.affectation;
  readonly vehiculeIcon = APP_ICONS.vehicule;
  readonly conducteurIcon = APP_ICONS.conducteur;
  readonly serviceIcon = APP_ICONS.serviceParc;

  readonly recherche = new FormControl('', { nonNullable: true });
  readonly statutFiltre = new FormControl<StatutAffectation | ''>('ACTIVE', { nonNullable: true });
  readonly ordreMissionFiltre = new FormControl<FiltreOrdreMission | ''>('', { nonNullable: true });
  page: PageResponse<Affectation> = emptyPage();
  options: AffectationOptions = { vehicules: [], servicesParcs: [], conducteurs: [] };
  selection: AffectationDetail | null = null;
  cibleChangement: Affectation | null = null;
  cibleRestitution: Affectation | null = null;
  ordreMission: OrdreMission | null = null;
  creationOuverte = false;
  chargement = true;
  chargementDetail = false;
  enregistrement = false;
  erreur = '';

  ngOnInit(): void {
    const statut = this.route.snapshot.queryParamMap.get('statut');
    const ordreMission = this.route.snapshot.queryParamMap.get('ordreMission');
    if (statut === 'ACTIVE' || statut === 'TERMINEE' || statut === '') {
      this.statutFiltre.setValue(statut, { emitEvent: false });
    }
    if (ordreMission === 'ELIGIBLE' || ordreMission === 'GENERE'
      || ordreMission === 'A_GENERER' || ordreMission === '') {
      this.ordreMissionFiltre.setValue(ordreMission, { emitEvent: false });
    }
    this.charger();
    this.chargerOptions();
    lierFiltresListe(this.destroyRef, [
      { control: this.recherche, debounce: 300 },
      { control: this.statutFiltre },
      { control: this.ordreMissionFiltre }
    ], () => this.charger(0));
  }

  charger(numeroPage = this.page.page): void {
    this.chargement = true;
    this.erreur = '';
    this.service.rechercher(
      this.recherche.value.trim(), this.statutFiltre.value,
      this.ordreMissionFiltre.value, numeroPage
    ).subscribe({
      next: page => { this.page = page; this.chargement = false; },
      error: error => { this.erreur = apiErrorMessage(error); this.chargement = false; }
    });
  }

  chargerOptions(): void {
    this.service.options().subscribe({
      next: options => this.options = options,
      error: error => this.toast.show('error', 'Options indisponibles', apiErrorMessage(error))
    });
  }

  ouvrirCreation(): void {
    this.cibleChangement = null;
    this.creationOuverte = true;
    this.chargerOptions();
  }

  consulter(item: Affectation): void {
    this.selection = null;
    this.chargementDetail = true;
    this.service.consulter(item.id).subscribe({
      next: detail => { this.selection = detail; this.chargementDetail = false; },
      error: error => {
        this.chargementDetail = false;
        this.toast.show('error', 'Consultation impossible', apiErrorMessage(error));
      }
    });
  }

  enregistrer(payload: AffectationPayload): void {
    this.enregistrement = true;
    const requete = this.cibleChangement
      ? this.service.changer(this.cibleChangement.id, {
          serviceParcId: payload.serviceParcId,
          conducteurId: payload.conducteurId,
          dateDebut: payload.dateDebut,
          motif: payload.motif,
          dateFinPrevue: payload.dateFinPrevue,
          typeMission: payload.typeMission
        })
      : this.service.creer(payload);
    requete.subscribe({
      next: detail => {
        const changement = !!this.cibleChangement;
        this.enregistrement = false;
        this.creationOuverte = false;
        this.cibleChangement = null;
        this.selection = detail;
        this.toast.show('success', changement ? 'Affectation changée' : 'Affectation créée');
        this.apresMouvement();
      },
      error: error => {
        this.enregistrement = false;
        this.toast.show('error', 'Enregistrement impossible', apiErrorMessage(error));
      }
    });
  }

  ouvrirChangement(item: Affectation): void {
    this.cibleChangement = item;
    this.creationOuverte = true;
    this.chargerOptions();
  }

  ouvrirOrdreMission(item: Affectation): void {
    this.ordreMissionService.obtenirPourAffectation(item.id).subscribe({
      next: ordre => {
        this.ordreMission = ordre;
        this.charger(this.page.page);
      },
      error: error => this.toast.show(
        'error', 'Ordre de mission indisponible', apiErrorMessage(error))
    });
  }

  restituer(valeur: { dateRestitution: string; motif: string }): void {
    if (!this.cibleRestitution) return;
    this.enregistrement = true;
    this.service.restituer(
      this.cibleRestitution.id, valeur.dateRestitution, valeur.motif
    ).subscribe({
      next: detail => {
        this.enregistrement = false;
        this.cibleRestitution = null;
        this.selection = detail;
        this.toast.show('success', 'Véhicule restitué au parc');
        this.apresMouvement();
      },
      error: error => {
        this.enregistrement = false;
        this.toast.show('error', 'Restitution impossible', apiErrorMessage(error));
      }
    });
  }

  private apresMouvement(): void {
    this.charger(0);
    this.chargerOptions();
  }

  get totalActives(): number {
    return this.statutFiltre.value === 'ACTIVE' ? this.page.totalElements : 0;
  }

  get timeline(): ActivityItem[] {
    return (this.selection?.journal ?? []).map(event => ({
      label: ({
        CREATION: 'Création de l’affectation',
        CHANGEMENT: 'Nouvelle affectation',
        CLOTURE_AUTOMATIQUE: 'Clôture automatique',
        RESTITUTION: 'Restitution au parc'
      } as Record<string, string>)[event.action] ?? event.action,
      date: event.dateEvenement,
      user: event.utilisateur,
      tone: event.action === 'RESTITUTION' ? 'gold' : 'green'
    }));
  }

  identifier(_index: number, item: Affectation): string { return item.id; }
}
