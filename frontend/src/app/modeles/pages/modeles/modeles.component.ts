import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { ToastService } from '../../../core/toast.service';
import { PermissionService } from '../../../core/permission.service';
import { MarqueService } from '../../../marques/data-access/marque.service';
import { MarqueDetail, MarqueOption, MarqueStatistiques } from '../../../marques/models/marque.models';
import { PageResponse } from '../../../shared/models/api.models';
import { APP_ICONS } from '../../../shared/icons/app-icons';
import { ActivityItem, ActivityTimelineComponent } from '../../../shared/ui/activity-timeline/activity-timeline.component';
import { AuditTrailComponent } from '../../../shared/ui/audit-trail/audit-trail.component';
import { ConfirmDialogComponent } from '../../../shared/ui/confirm-dialog/confirm-dialog.component';
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
import { versTimelineAudit } from '../../../shared/utils/entity-audit';
import { lierFiltresListe } from '../../../shared/utils/list-filters';
import {
  ModeleFormModalComponent,
  ModeleFormMode,
  ModeleFormValue
} from '../../components/modele-form-modal/modele-form-modal.component';
import { ModeleService } from '../../data-access/modele.service';
import { Modele, ModeleDetail, ModeleListe } from '../../models/modele.models';

@Component({
    selector: 'app-modeles',
    imports: [
        CommonModule,
        ReactiveFormsModule,
        ActivityTimelineComponent,
        AuditTrailComponent,
        ConfirmDialogComponent,
        DataTableComponent,
        DetailModalComponent,
        EmptyStateComponent,
        ModeleFormModalComponent,
        PageHeaderComponent,
        PaginationComponent,
        SearchToolbarComponent,
        SummaryCardComponent,
        TableActionComponent,
        TableLoadingComponent
    ],
    templateUrl: './modeles.component.html',
    styleUrls: ['../../../shared/styles/entity-list.css', '../../../shared/styles/detail-identity.css', './modeles.component.css']
})
export class ModelesComponent implements OnInit {
  readonly permissions = inject(PermissionService);
  private readonly marquesService = inject(MarqueService);
  private readonly service = inject(ModeleService);
  private readonly toast = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);

  readonly modelesIcon = APP_ICONS.modele;
  readonly marquesIcon = APP_ICONS.marque;
  readonly recherche = new FormControl('', { nonNullable: true });

  page: PageResponse<ModeleListe> = emptyPage();
  statistiques: MarqueStatistiques = { totalMarques: 0, totalModeles: 0 };
  marques: MarqueOption[] = [];
  chargement = true;
  enregistrement = false;
  erreur = '';
  dialogOuvert = false;
  dialogMode: ModeleFormMode = 'create';
  modeleModifie: ModeleListe | null = null;
  modeleASupprimer: ModeleListe | null = null;
  selection: ModeleDetail | null = null;
  chargementDetail = false;

  ngOnInit(): void {
    this.chargerRéférentiels();
    this.charger();
    lierFiltresListe(this.destroyRef, [
      { control: this.recherche, debounce: 300 }
    ], () => this.charger(0));
  }

  charger(page = this.page.page): void {
    this.chargement = true;
    this.erreur = '';
    this.chargerStatistiques();
    this.service.rechercher(this.recherche.value.trim(), page).subscribe({
      next: résultat => {
        this.page = résultat;
        this.chargement = false;
      },
      error: erreur => {
        this.erreur = apiErrorMessage(erreur);
        this.chargement = false;
      }
    });
  }

  ouvrirCreation(): void {
    if (!this.marques.length) {
      this.toast.show('error', 'Ajout impossible', 'Ajoutez d’abord une marque.');
      return;
    }
    this.dialogMode = 'create';
    this.modeleModifie = null;
    this.dialogOuvert = true;
  }

  ouvrirModification(modele: ModeleListe): void {
    this.dialogMode = 'edit';
    this.modeleModifie = modele;
    this.dialogOuvert = true;
  }

  consulter(modele: ModeleListe | Modele): void {
    this.selection = null;
    this.chargementDetail = true;
    this.service.consulter(modele.id).subscribe({
      next: détail => {
        this.selection = détail;
        this.chargementDetail = false;
      },
      error: erreur => {
        this.chargementDetail = false;
        this.toast.show('error', 'Consultation impossible', apiErrorMessage(erreur));
      }
    });
  }

  enregistrer(valeur: ModeleFormValue): void {
    this.enregistrement = true;
    const requête: Observable<MarqueDetail | Modele> = this.dialogMode === 'create'
      ? this.service.ajouter(valeur.marqueCode, valeur.noms)
      : this.service.modifier(this.modeleModifie!.id, valeur.noms[0]);
    requête.subscribe({
      next: résultat => {
        this.enregistrement = false;
        this.dialogOuvert = false;
        if (!('modeles' in résultat) && this.selection?.id === résultat.id) this.consulter(résultat);
        this.toast.show('success', this.dialogMode === 'create' ? 'Modèle(s) ajouté(s)' : 'Modèle modifié');
        this.charger(this.page.page);
      },
      error: erreur => {
        this.enregistrement = false;
        this.toast.show('error', 'Enregistrement impossible', apiErrorMessage(erreur));
      }
    });
  }

  confirmerSuppression(): void {
    if (!this.modeleASupprimer) return;
    const cible = this.modeleASupprimer;
    this.enregistrement = true;
    this.service.supprimer(cible.id).subscribe({
      next: () => {
        this.enregistrement = false;
        this.modeleASupprimer = null;
        if (this.selection?.id === cible.id) this.selection = null;
        this.toast.show('success', 'Modèle supprimé');
        this.charger(this.page.page);
      },
      error: erreur => {
        this.enregistrement = false;
        this.modeleASupprimer = null;
        this.toast.show('error', 'Suppression impossible', apiErrorMessage(erreur));
      }
    });
  }

  identifierModele(_index: number, modele: ModeleListe): string {
    return modele.id;
  }

  get historique(): ActivityItem[] {
    return versTimelineAudit(this.selection?.historique ?? []);
  }

  private chargerRéférentiels(): void {
    this.marquesService.listerMarques().subscribe({
      next: marques => this.marques = marques,
      error: () => this.marques = []
    });
  }

  private chargerStatistiques(): void {
    this.marquesService.statistiques().subscribe({
      next: stats => this.statistiques = stats,
      error: () => {}
    });
  }

}
