import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { ToastService } from '../../../core/toast.service';
import { PermissionService } from '../../../core/permission.service';
import { ModeleFormModalComponent, ModeleFormValue } from '../../../modeles/components/modele-form-modal/modele-form-modal.component';
import { ModeleService } from '../../../modeles/data-access/modele.service';
import { Modele, ModeleDetail } from '../../../modeles/models/modele.models';
import { PageResponse } from '../../../shared/models/api.models';
import { APP_ICONS } from '../../../shared/icons/app-icons';
import { ActivityItem, ActivityTimelineComponent } from '../../../shared/ui/activity-timeline/activity-timeline.component';
import { AuditTrailComponent } from '../../../shared/ui/audit-trail/audit-trail.component';
import { ConfirmDialogComponent } from '../../../shared/ui/confirm-dialog/confirm-dialog.component';
import { DataTableComponent } from '../../../shared/ui/data-table/data-table.component';
import { DetailModalComponent } from '../../../shared/ui/detail-modal/detail-modal.component';
import { DynamicTextListComponent } from '../../../shared/ui/dynamic-text-list/dynamic-text-list.component';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { FormFieldComponent } from '../../../shared/ui/form-field/form-field.component';
import { FormModalComponent } from '../../../shared/ui/form-modal/form-modal.component';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header.component';
import { PaginationComponent } from '../../../shared/ui/pagination/pagination.component';
import { SearchToolbarComponent } from '../../../shared/ui/search-toolbar/search-toolbar.component';
import { SummaryCardComponent } from '../../../shared/ui/summary-card/summary-card.component';
import { TableActionComponent } from '../../../shared/ui/table-action/table-action.component';
import { TableLoadingComponent } from '../../../shared/ui/table-loading/table-loading.component';
import { ToggleFieldComponent } from '../../../shared/ui/toggle-field/toggle-field.component';
import { apiErrorMessage } from '../../../shared/utils/api-error';
import { emptyPage } from '../../../shared/utils/empty-page';
import { versTimelineAudit } from '../../../shared/utils/entity-audit';
import { nettoyerListeTexte } from '../../../shared/utils/text-list';
import { lierFiltresListe } from '../../../shared/utils/list-filters';
import { MarqueService } from '../../data-access/marque.service';
import { MarqueDetail, MarqueListe, MarqueStatistiques } from '../../models/marque.models';

type MarqueDialogMode = 'create' | 'edit';
type ModeleDialogMode = 'create' | 'edit';
type Suppression = { type: 'marque'; code: string; libelle: string } | { type: 'modele'; id: string; libelle: string };

@Component({
    selector: 'app-marques',
    imports: [
        CommonModule,
        ReactiveFormsModule,
        ActivityTimelineComponent,
        AuditTrailComponent,
        PageHeaderComponent,
        EmptyStateComponent,
        ConfirmDialogComponent,
        DataTableComponent,
        DetailModalComponent,
        DynamicTextListComponent,
        FormModalComponent,
        FormFieldComponent,
        PaginationComponent,
        SearchToolbarComponent,
        SummaryCardComponent,
        TableActionComponent,
        TableLoadingComponent,
        ToggleFieldComponent,
        ModeleFormModalComponent
    ],
    templateUrl: './marques.component.html',
    styleUrls: ['../../../shared/styles/entity-list.css', '../../../shared/styles/detail-identity.css', './marques.component.css']
})
export class MarquesComponent implements OnInit {
  readonly permissions = inject(PermissionService);
  private readonly service = inject(MarqueService);
  private readonly modelesService = inject(ModeleService);
  private readonly toast = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);

  readonly marquesIcon = APP_ICONS.marque;
  readonly modelesIcon = APP_ICONS.modele;

  readonly recherche = new FormControl('', { nonNullable: true });
  readonly marqueForm = new FormGroup({
    designation: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(80)] }),
    ajouterModeles: new FormControl(false, { nonNullable: true }),
    modeles: new FormArray<FormControl<string>>([])
  });
  page: PageResponse<MarqueListe> = emptyPage();
  statistiques: MarqueStatistiques = { totalMarques: 0, totalModeles: 0 };
  selection: MarqueDetail | null = null;
  selectionModele: ModeleDetail | null = null;
  chargement = true;
  chargementDetail = false;
  chargementDetailModele = false;
  enregistrement = false;
  erreur = '';
  marqueDialogOuvert = false;
  marqueDialogMode: MarqueDialogMode = 'create';
  modeleDialogOuvert = false;
  modeleDialogMode: ModeleDialogMode = 'create';
  marqueModifiée: MarqueListe | null = null;
  modeleModifie: Modele | null = null;
  suppression: Suppression | null = null;

  ngOnInit(): void {
    this.réinitialiserListe(this.marqueForm.controls.modeles);
    this.chargerStatistiques();
    this.charger();
    lierFiltresListe(this.destroyRef, [
      { control: this.recherche, debounce: 300 }
    ], () => this.charger(0));
  }

  chargerStatistiques(): void {
    this.service.statistiques().subscribe({
      next: stats => this.statistiques = stats,
      error: () => {}
    });
  }

  charger(page = this.page.page): void {
    this.chargement = true;
    this.erreur = '';
    this.chargerStatistiques();
    this.service.rechercher(this.recherche.value.trim(), page).subscribe({
      next: résultat => { this.page = résultat; this.chargement = false; },
      error: erreur => { this.erreur = apiErrorMessage(erreur); this.chargement = false; }
    });
  }

  ouvrirCreation(): void {
    this.marqueDialogMode = 'create';
    this.marqueModifiée = null;
    this.marqueForm.controls.designation.reset('');
    this.marqueForm.controls.ajouterModeles.reset(false);
    this.réinitialiserListe(this.marqueForm.controls.modeles);
    this.marqueDialogOuvert = true;
  }

  ouvrirModification(marque: MarqueListe): void {
    this.marqueDialogMode = 'edit';
    this.marqueModifiée = marque;
    this.marqueForm.controls.designation.reset(marque.designation);
    this.marqueForm.controls.ajouterModeles.reset(false);
    this.réinitialiserListe(this.marqueForm.controls.modeles);
    this.marqueDialogOuvert = true;
  }

  enregistrerMarque(): void {
    if (this.marqueForm.invalid) {
      this.marqueForm.markAllAsTouched();
      return;
    }
    const valeur = this.marqueForm.getRawValue();
    const modèles = valeur.ajouterModeles ? nettoyerListeTexte(valeur.modeles) : [];
    if (valeur.ajouterModeles && modèles.length === 0) {
      this.marqueForm.controls.modeles.at(0).setErrors({ required: true });
      this.marqueForm.controls.modeles.at(0).markAsTouched();
      return;
    }

    this.enregistrement = true;
    const requête = this.marqueDialogMode === 'create'
      ? this.service.créer(valeur.designation, modèles)
      : this.service.modifier(this.marqueModifiée!.code, valeur.designation);
    requête.subscribe({
      next: marque => {
        this.enregistrement = false;
        this.marqueDialogOuvert = false;
        if (this.selection?.code === marque.code) this.selection = marque;
        this.toast.show('success', this.marqueDialogMode === 'create' ? 'Marque créée' : 'Marque modifiée');
        this.charger(this.page.page);
      },
      error: erreur => { this.enregistrement = false; this.toast.show('error', 'Enregistrement impossible', apiErrorMessage(erreur)); }
    });
  }

  consulter(marque: MarqueListe): void {
    this.selection = null;
    this.chargementDetail = true;
    this.service.consulter(marque.code).subscribe({
      next: détail => { this.selection = détail; this.chargementDetail = false; },
      error: erreur => { this.chargementDetail = false; this.toast.show('error', 'Consultation impossible', apiErrorMessage(erreur)); }
    });
  }

  fermerDetail(): void {
    this.selection = null;
    this.selectionModele = null;
  }

  consulterModele(modèle: Modele): void {
    this.selectionModele = null;
    this.chargementDetailModele = true;
    this.modelesService.consulter(modèle.id).subscribe({
      next: détail => {
        this.selectionModele = détail;
        this.chargementDetailModele = false;
      },
      error: erreur => {
        this.chargementDetailModele = false;
        this.toast.show('error', 'Consultation impossible', apiErrorMessage(erreur));
      }
    });
  }

  ouvrirAjoutModele(): void {
    this.modeleDialogMode = 'create';
    this.modeleModifie = null;
    this.modeleDialogOuvert = true;
  }

  ouvrirModificationModele(modèle: Modele): void {
    this.modeleDialogMode = 'edit';
    this.modeleModifie = modèle;
    this.modeleDialogOuvert = true;
  }

  enregistrerModele(valeur: ModeleFormValue): void {
    if (!this.selection) return;
    this.enregistrement = true;
    const requête: Observable<MarqueDetail | Modele> = this.modeleDialogMode === 'create'
      ? this.modelesService.ajouter(this.selection.code, valeur.noms)
      : this.modelesService.modifier(this.modeleModifie!.id, valeur.noms[0]);
    requête.subscribe({
      next: résultat => {
        this.enregistrement = false;
        this.modeleDialogOuvert = false;
        if ('modeles' in résultat) {
          this.selection = résultat;
        } else if (this.selection) {
          this.selection = { ...this.selection, modeles: this.selection.modeles.map(item => item.id === résultat.id ? résultat : item) };
          if (this.selectionModele?.id === résultat.id) this.consulterModele(résultat);
        }
        this.toast.show('success', this.modeleDialogMode === 'create' ? 'Modèle(s) ajouté(s)' : 'Modèle modifié');
        this.charger(this.page.page);
      },
      error: erreur => { this.enregistrement = false; this.toast.show('error', 'Enregistrement impossible', apiErrorMessage(erreur)); }
    });
  }

  demanderSuppressionMarque(marque: MarqueListe): void {
    this.suppression = { type: 'marque', code: marque.code, libelle: marque.designation };
  }

  demanderSuppressionModele(modèle: Modele): void {
    this.suppression = { type: 'modele', id: modèle.id, libelle: modèle.nom };
  }

  confirmerSuppression(): void {
    if (!this.suppression) return;
    this.enregistrement = true;
    const cible = this.suppression;
    const requête = cible.type === 'marque'
      ? this.service.supprimer(cible.code)
      : this.modelesService.supprimer(cible.id);
    requête.subscribe({
      next: () => {
        this.enregistrement = false;
        this.suppression = null;
        if (cible.type === 'marque') this.selection = null;
        if (cible.type === 'modele' && this.selection) {
          this.selection = { ...this.selection, modeles: this.selection.modeles.filter(item => item.id !== cible.id) };
          if (this.selectionModele?.id === cible.id) this.selectionModele = null;
        }
        this.toast.show('success', cible.type === 'marque' ? 'Marque supprimée' : 'Modèle supprimé');
        this.charger(this.page.page);
      },
      error: erreur => { this.enregistrement = false; this.suppression = null; this.toast.show('error', 'Suppression impossible', apiErrorMessage(erreur)); }
    });
  }

  identifierMarque(_index: number, marque: MarqueListe): string { return marque.code; }
  identifierModele(_index: number, modèle: Modele): string { return modèle.id; }

  get historiqueMarque(): ActivityItem[] {
    return versTimelineAudit(this.selection?.historique ?? []);
  }

  get historiqueModele(): ActivityItem[] {
    return versTimelineAudit(this.selectionModele?.historique ?? []);
  }

  private réinitialiserListe(liste: FormArray<FormControl<string>>): void {
    liste.clear();
  }

}
