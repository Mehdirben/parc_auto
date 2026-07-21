import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable, Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { ToastService } from '../../core/toast.service';
import { ConfirmDialogComponent } from '../../shared/ui/confirm-dialog/confirm-dialog.component';
import { AuditTrailComponent } from '../../shared/ui/audit-trail/audit-trail.component';
import { DataTableComponent } from '../../shared/ui/data-table/data-table.component';
import { DetailDrawerComponent } from '../../shared/ui/detail-drawer/detail-drawer.component';
import { EmptyStateComponent } from '../../shared/ui/empty-state/empty-state.component';
import { FormModalComponent } from '../../shared/ui/form-modal/form-modal.component';
import { FormFieldComponent } from '../../shared/ui/form-field/form-field.component';
import { PageHeaderComponent } from '../../shared/ui/page-header/page-header.component';
import { PaginationComponent } from '../../shared/ui/pagination/pagination.component';
import { SearchToolbarComponent } from '../../shared/ui/search-toolbar/search-toolbar.component';
import { SummaryCardComponent } from '../../shared/ui/summary-card/summary-card.component';
import { TableActionComponent } from '../../shared/ui/table-action/table-action.component';
import { TableLoadingComponent } from '../../shared/ui/table-loading/table-loading.component';
import { ToggleFieldComponent } from '../../shared/ui/toggle-field/toggle-field.component';
import { ApiProblem, MarqueDetail, MarqueListe, MarqueStatistiques, Modele, PageResponse } from './marque.models';
import { MarqueService } from './marque.service';

type MarqueDialogMode = 'create' | 'edit';
type ModeleDialogMode = 'create' | 'edit';
type Suppression = { type: 'marque'; code: string; libelle: string } | { type: 'modele'; id: string; libelle: string };

@Component({
  selector: 'app-marques-modeles',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AuditTrailComponent,
    PageHeaderComponent,
    EmptyStateComponent,
    ConfirmDialogComponent,
    DataTableComponent,
    DetailDrawerComponent,
    FormModalComponent,
    FormFieldComponent,
    PaginationComponent,
    SearchToolbarComponent,
    SummaryCardComponent,
    TableActionComponent,
    TableLoadingComponent,
    ToggleFieldComponent
  ],
  templateUrl: './marques-modeles.component.html',
  styleUrls: ['./marques-modeles.component.css']
})
export class MarquesModelesComponent implements OnInit, OnDestroy {
  private readonly service = inject(MarqueService);
  private readonly toast = inject(ToastService);
  private readonly destroy$ = new Subject<void>();

  readonly marquesIcon = 'M4 4h7v7H4V4Zm9 0h7v7h-7V4ZM4 13h7v7H4v-7Zm9 0h7v7h-7v-7Z';
  readonly modelesIcon = 'M18.92 6.01 17.08 2.33A2 2 0 0 0 15.29 1H8.71a2 2 0 0 0-1.79 1.33L5.08 6.01A3 3 0 0 0 3 8.86V17h2v2h2v-2h10v2h2v-2h2V8.86a3 3 0 0 0-2.08-2.85ZM8.71 3h6.58l1.5 3H7.21l1.5-3ZM7 14a2 2 0 1 1 0-4 2 2 0 0 1 0 4Zm10 0a2 2 0 1 1 0-4 2 2 0 0 1 0 4Z';

  readonly recherche = new FormControl('', { nonNullable: true });
  readonly marqueForm = new FormGroup({
    designation: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(80)] }),
    ajouterModeles: new FormControl(false, { nonNullable: true }),
    modeles: new FormControl('', { nonNullable: true })
  });
  readonly modeleForm = new FormGroup({
    nom: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(80)] })
  });

  page: PageResponse<MarqueListe> = this.pageVide();
  statistiques: MarqueStatistiques = { totalMarques: 0, totalModeles: 0 };
  selection: MarqueDetail | null = null;
  chargement = true;
  chargementDetail = false;
  enregistrement = false;
  erreur = '';
  marqueDialogOuvert = false;
  marqueDialogMode: MarqueDialogMode = 'create';
  modeleDialogOuvert = false;
  modeleDialogMode: ModeleDialogMode = 'create';
  marqueModifiée: MarqueListe | null = null;
  modeleModifié: Modele | null = null;
  suppression: Suppression | null = null;

  ngOnInit(): void {
    this.chargerStatistiques();
    this.charger();
    this.recherche.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(() => this.charger(0));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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
      error: erreur => { this.erreur = this.messageErreur(erreur); this.chargement = false; }
    });
  }

  ouvrirCreation(): void {
    this.marqueDialogMode = 'create';
    this.marqueModifiée = null;
    this.marqueForm.reset({ designation: '', ajouterModeles: false, modeles: '' });
    this.marqueDialogOuvert = true;
  }

  ouvrirModification(marque: MarqueListe): void {
    this.marqueDialogMode = 'edit';
    this.marqueModifiée = marque;
    this.marqueForm.reset({ designation: marque.designation, ajouterModeles: false, modeles: '' });
    this.marqueDialogOuvert = true;
  }

  enregistrerMarque(): void {
    if (this.marqueForm.invalid) {
      this.marqueForm.markAllAsTouched();
      return;
    }
    const valeur = this.marqueForm.getRawValue();
    const modèles = valeur.ajouterModeles ? this.découper(valeur.modeles) : [];
    if (valeur.ajouterModeles && modèles.length === 0) {
      this.marqueForm.controls.modeles.setErrors({ required: true });
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
      error: erreur => { this.enregistrement = false; this.toast.show('error', 'Enregistrement impossible', this.messageErreur(erreur)); }
    });
  }

  consulter(marque: MarqueListe): void {
    this.selection = null;
    this.chargementDetail = true;
    this.service.consulter(marque.code).subscribe({
      next: détail => { this.selection = détail; this.chargementDetail = false; },
      error: erreur => { this.chargementDetail = false; this.toast.show('error', 'Consultation impossible', this.messageErreur(erreur)); }
    });
  }

  fermerDetail(): void {
    this.selection = null;
  }

  ouvrirAjoutModele(): void {
    this.modeleDialogMode = 'create';
    this.modeleModifié = null;
    this.modeleForm.reset({ nom: '' });
    this.modeleForm.controls.nom.setValidators([Validators.required, Validators.maxLength(500)]);
    this.modeleForm.controls.nom.updateValueAndValidity();
    this.modeleDialogOuvert = true;
  }

  ouvrirModificationModele(modèle: Modele): void {
    this.modeleDialogMode = 'edit';
    this.modeleModifié = modèle;
    this.modeleForm.reset({ nom: modèle.nom });
    this.modeleForm.controls.nom.setValidators([Validators.required, Validators.maxLength(80)]);
    this.modeleForm.controls.nom.updateValueAndValidity();
    this.modeleDialogOuvert = true;
  }

  enregistrerModele(): void {
    if (this.modeleForm.invalid || !this.selection) {
      this.modeleForm.markAllAsTouched();
      return;
    }
    const valeur = this.modeleForm.controls.nom.value;
    const noms = this.découper(valeur);
    if (!noms.length) return;
    this.enregistrement = true;
    const requête: Observable<MarqueDetail | Modele> = this.modeleDialogMode === 'create'
      ? this.service.ajouterModèles(this.selection.code, noms)
      : this.service.modifierModèle(this.modeleModifié!.id, noms[0]);
    requête.subscribe({
      next: résultat => {
        this.enregistrement = false;
        this.modeleDialogOuvert = false;
        if ('modeles' in résultat) {
          this.selection = résultat;
        } else if (this.selection) {
          this.selection = { ...this.selection, modeles: this.selection.modeles.map(item => item.id === résultat.id ? résultat : item) };
        }
        this.toast.show('success', this.modeleDialogMode === 'create' ? 'Modèle(s) ajouté(s)' : 'Modèle modifié');
        this.charger(this.page.page);
      },
      error: erreur => { this.enregistrement = false; this.toast.show('error', 'Enregistrement impossible', this.messageErreur(erreur)); }
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
    const requête = cible.type === 'marque' ? this.service.supprimer(cible.code) : this.service.supprimerModèle(cible.id);
    requête.subscribe({
      next: () => {
        this.enregistrement = false;
        this.suppression = null;
        if (cible.type === 'marque') this.selection = null;
        if (cible.type === 'modele' && this.selection) {
          this.selection = { ...this.selection, modeles: this.selection.modeles.filter(item => item.id !== cible.id) };
        }
        this.toast.show('success', cible.type === 'marque' ? 'Marque supprimée' : 'Modèle supprimé');
        this.charger(this.page.page);
      },
      error: erreur => { this.enregistrement = false; this.suppression = null; this.toast.show('error', 'Suppression impossible', this.messageErreur(erreur)); }
    });
  }

  identifierMarque(_index: number, marque: MarqueListe): string { return marque.code; }
  identifierModele(_index: number, modèle: Modele): string { return modèle.id; }

  private découper(valeur: string): string[] {
    return [...new Map(valeur.split(';').map(nom => nom.trim()).filter(Boolean).map(nom => [nom.toLocaleUpperCase('fr'), nom])).values()];
  }

  private messageErreur(erreur: unknown): string {
    if (erreur instanceof HttpErrorResponse) {
      const problem = erreur.error as ApiProblem | null;
      return problem?.detail || (erreur.status === 0 ? 'Le serveur est inaccessible.' : 'Une erreur inattendue est survenue.');
    }
    return 'Une erreur inattendue est survenue.';
  }

  private pageVide(): PageResponse<MarqueListe> {
    return { contenu: [], page: 0, taille: 10, totalElements: 0, totalPages: 0, premiere: true, derniere: true };
  }
}
