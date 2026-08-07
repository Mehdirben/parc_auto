import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastService } from '../../../core/toast.service';
import { PermissionService } from '../../../core/permission.service';
import { APP_ICONS } from '../../../shared/icons/app-icons';
import { ActivityItem, ActivityTimelineComponent } from '../../../shared/ui/activity-timeline/activity-timeline.component';
import { AuditTrailComponent } from '../../../shared/ui/audit-trail/audit-trail.component';
import { ConfirmDialogComponent } from '../../../shared/ui/confirm-dialog/confirm-dialog.component';
import { DataTableComponent } from '../../../shared/ui/data-table/data-table.component';
import { DetailModalComponent } from '../../../shared/ui/detail-modal/detail-modal.component';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { FormFieldComponent } from '../../../shared/ui/form-field/form-field.component';
import { FormModalComponent } from '../../../shared/ui/form-modal/form-modal.component';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header.component';
import { PaginationComponent } from '../../../shared/ui/pagination/pagination.component';
import { SearchToolbarComponent } from '../../../shared/ui/search-toolbar/search-toolbar.component';
import { SummaryCardComponent } from '../../../shared/ui/summary-card/summary-card.component';
import { TableActionComponent } from '../../../shared/ui/table-action/table-action.component';
import { TableLoadingComponent } from '../../../shared/ui/table-loading/table-loading.component';
import { PageResponse } from '../../../shared/models/api.models';
import { apiErrorMessage } from '../../../shared/utils/api-error';
import { emptyPage } from '../../../shared/utils/empty-page';
import { versElementsTimeline } from '../../../shared/utils/audit-timeline';
import { lierFiltresListe } from '../../../shared/utils/list-filters';
import { ServiceParcService } from '../../data-access/service-parc.service';
import { ActionServiceParc, ServiceParcDetail, ServiceParcListe, ServiceParcStatistiques, TypeServiceParc } from '../../models/service-parc.models';

type DialogMode = 'create' | 'edit';
type StatutFiltre = '' | 'actif' | 'inactif';
const LIBELLES_ACTIONS: Record<ActionServiceParc, string> = {
  CREATION: 'Création',
  MODIFICATION: 'Modification',
  ACTIVATION: 'Activation',
  DESACTIVATION: 'Désactivation'
};

@Component({
    selector: 'app-services-parcs',
    imports: [
        CommonModule, ReactiveFormsModule, ActivityTimelineComponent, AuditTrailComponent,
        ConfirmDialogComponent, DataTableComponent, DetailModalComponent, EmptyStateComponent,
        FormFieldComponent, FormModalComponent, PageHeaderComponent, PaginationComponent,
        SearchToolbarComponent, SummaryCardComponent, TableActionComponent, TableLoadingComponent
    ],
    templateUrl: './services-parcs.component.html',
    styleUrls: ['../../../shared/styles/detail-identity.css', './services-parcs.component.css']
})
export class ServicesParcsComponent implements OnInit {
  readonly permissions = inject(PermissionService);
  private readonly service = inject(ServiceParcService);
  private readonly toast = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);

  readonly buildingIcon = APP_ICONS.serviceParc;
  readonly activeIcon = APP_ICONS.actif;
  readonly directionIcon = APP_ICONS.direction;
  readonly parcIcon = APP_ICONS.parc;

  readonly recherche = new FormControl('', { nonNullable: true });
  readonly typeFiltre = new FormControl<TypeServiceParc | ''>('', { nonNullable: true });
  readonly statutFiltre = new FormControl<StatutFiltre>('', { nonNullable: true });
  readonly formulaire = new FormGroup({
    code: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(20)] }),
    libelle: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(100)] }),
    type: new FormControl<TypeServiceParc>('DIRECTION', { nonNullable: true, validators: [Validators.required] })
  });

  page: PageResponse<ServiceParcListe> = emptyPage();
  statistiques: ServiceParcStatistiques = { total: 0, actifs: 0, directions: 0, parcsCommuns: 0 };
  selection: ServiceParcDetail | null = null;
  cibleStatut: ServiceParcListe | ServiceParcDetail | null = null;
  chargement = true;
  chargementDetail = false;
  enregistrement = false;
  erreur = '';
  dialogueOuvert = false;
  dialogueMode: DialogMode = 'create';
  serviceModifié: ServiceParcListe | ServiceParcDetail | null = null;

  ngOnInit(): void {
    this.charger();
    lierFiltresListe(this.destroyRef, [
      { control: this.recherche, debounce: 300 },
      { control: this.typeFiltre },
      { control: this.statutFiltre }
    ], () => this.charger(0));
  }

  charger(numeroPage = this.page.page): void {
    this.chargement = true;
    this.erreur = '';
    this.service.rechercher(this.recherche.value.trim(), this.typeFiltre.value, this.statutFiltre.value, numeroPage).subscribe({
      next: résultat => { this.page = résultat; this.chargement = false; },
      error: erreur => { this.erreur = apiErrorMessage(erreur); this.chargement = false; }
    });
    this.service.statistiques().subscribe({ next: résultat => this.statistiques = résultat });
  }

  ouvrirCreation(): void {
    this.dialogueMode = 'create';
    this.serviceModifié = null;
    this.formulaire.reset({ code: '', libelle: '', type: 'DIRECTION' });
    this.dialogueOuvert = true;
  }

  ouvrirModification(serviceParc: ServiceParcListe | ServiceParcDetail): void {
    this.dialogueMode = 'edit';
    this.serviceModifié = serviceParc;
    this.formulaire.reset({ code: serviceParc.code, libelle: serviceParc.libelle, type: serviceParc.type });
    this.dialogueOuvert = true;
  }

  enregistrer(): void {
    if (this.formulaire.invalid) {
      this.formulaire.markAllAsTouched();
      return;
    }
    const valeur = this.formulaire.getRawValue();
    this.enregistrement = true;
    const requête = this.dialogueMode === 'create'
      ? this.service.créer(valeur.code, valeur.libelle, valeur.type)
      : this.service.modifier(this.serviceModifié!.code, valeur.code, valeur.libelle, valeur.type);
    requête.subscribe({
      next: résultat => {
        this.enregistrement = false;
        this.dialogueOuvert = false;
        if (this.selection?.code === this.serviceModifié?.code) this.selection = résultat;
        this.toast.show('success', this.dialogueMode === 'create' ? 'Service créé' : 'Service modifié');
        this.charger(this.page.page);
      },
      error: erreur => {
        this.enregistrement = false;
        this.toast.show('error', 'Enregistrement impossible', apiErrorMessage(erreur));
      }
    });
  }

  consulter(serviceParc: ServiceParcListe): void {
    this.selection = null;
    this.chargementDetail = true;
    this.service.consulter(serviceParc.code).subscribe({
      next: détail => { this.selection = détail; this.chargementDetail = false; },
      error: erreur => {
        this.chargementDetail = false;
        this.toast.show('error', 'Consultation impossible', apiErrorMessage(erreur));
      }
    });
  }

  demanderChangementStatut(serviceParc: ServiceParcListe | ServiceParcDetail): void {
    this.cibleStatut = serviceParc;
  }

  confirmerChangementStatut(): void {
    if (!this.cibleStatut) return;
    const cible = this.cibleStatut;
    this.enregistrement = true;
    this.service.changerStatut(cible.code, !cible.actif).subscribe({
      next: résultat => {
        this.enregistrement = false;
        this.cibleStatut = null;
        if (this.selection?.code === cible.code) this.selection = résultat;
        this.toast.show('success', résultat.actif ? 'Service activé' : 'Service désactivé');
        this.charger(this.page.page);
      },
      error: erreur => {
        this.enregistrement = false;
        this.cibleStatut = null;
        this.toast.show('error', 'Changement de statut impossible', apiErrorMessage(erreur));
      }
    });
  }

  libelleType(type: TypeServiceParc): string {
    return type === 'DIRECTION' ? 'Direction' : 'Parc commun';
  }

  get historique(): ActivityItem[] {
    return versElementsTimeline(
      this.selection?.historique ?? [],
      LIBELLES_ACTIONS,
      action => action === 'DESACTIVATION' ? 'red' : action === 'MODIFICATION' ? 'gold' : 'green'
    );
  }

  identifier(_index: number, serviceParc: ServiceParcListe): string { return serviceParc.code; }

}
