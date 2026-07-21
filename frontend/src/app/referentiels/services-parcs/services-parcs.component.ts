import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { ToastService } from '../../core/toast.service';
import { ActivityItem, ActivityTimelineComponent } from '../../shared/ui/activity-timeline/activity-timeline.component';
import { AuditTrailComponent } from '../../shared/ui/audit-trail/audit-trail.component';
import { ConfirmDialogComponent } from '../../shared/ui/confirm-dialog/confirm-dialog.component';
import { DataTableComponent } from '../../shared/ui/data-table/data-table.component';
import { DetailDrawerComponent } from '../../shared/ui/detail-drawer/detail-drawer.component';
import { EmptyStateComponent } from '../../shared/ui/empty-state/empty-state.component';
import { FormFieldComponent } from '../../shared/ui/form-field/form-field.component';
import { FormModalComponent } from '../../shared/ui/form-modal/form-modal.component';
import { PageHeaderComponent } from '../../shared/ui/page-header/page-header.component';
import { PaginationComponent } from '../../shared/ui/pagination/pagination.component';
import { SearchToolbarComponent } from '../../shared/ui/search-toolbar/search-toolbar.component';
import { SummaryCardComponent } from '../../shared/ui/summary-card/summary-card.component';
import { TableActionComponent } from '../../shared/ui/table-action/table-action.component';
import { TableLoadingComponent } from '../../shared/ui/table-loading/table-loading.component';
import { ApiProblem, PageResponse, ServiceParcDetail, ServiceParcListe, ServiceParcStatistiques, TypeServiceParc } from './service-parc.models';
import { ServiceParcService } from './service-parc.service';

type DialogMode = 'create' | 'edit';
type StatutFiltre = '' | 'actif' | 'inactif';

@Component({
  selector: 'app-services-parcs',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, ActivityTimelineComponent, AuditTrailComponent,
    ConfirmDialogComponent, DataTableComponent, DetailDrawerComponent, EmptyStateComponent,
    FormFieldComponent, FormModalComponent, PageHeaderComponent, PaginationComponent,
    SearchToolbarComponent, SummaryCardComponent, TableActionComponent, TableLoadingComponent
  ],
  templateUrl: './services-parcs.component.html',
  styleUrls: ['./services-parcs.component.css']
})
export class ServicesParcsComponent implements OnInit, OnDestroy {
  private readonly service = inject(ServiceParcService);
  private readonly toast = inject(ToastService);
  private readonly destroy$ = new Subject<void>();

  readonly buildingIcon = 'M12 3 2 8v2h20V8L12 3ZM4 12v7H2v2h20v-2h-2v-7h-2v7h-4v-7h-4v7H6v-7H4Z';
  readonly activeIcon = 'M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17Z';
  readonly directionIcon = 'M4 4h16v16H4V4Zm3 3v3h3V7H7Zm7 0v3h3V7h-3ZM7 14v3h3v-3H7Zm7 0v3h3v-3h-3Z';
  readonly parcIcon = 'M18.92 6.01 17.08 2.33A2 2 0 0 0 15.29 1H8.71a2 2 0 0 0-1.79 1.33L5.08 6.01A3 3 0 0 0 3 8.86V17h2v2h2v-2h10v2h2v-2h2V8.86a3 3 0 0 0-2.08-2.85ZM8.71 3h6.58l1.5 3H7.21l1.5-3ZM7 14a2 2 0 1 1 0-4 2 2 0 0 1 0 4Zm10 0a2 2 0 1 1 0-4 2 2 0 0 1 0 4Z';

  readonly recherche = new FormControl('', { nonNullable: true });
  readonly typeFiltre = new FormControl<TypeServiceParc | ''>('', { nonNullable: true });
  readonly statutFiltre = new FormControl<StatutFiltre>('', { nonNullable: true });
  readonly formulaire = new FormGroup({
    code: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(20)] }),
    libelle: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(100)] }),
    type: new FormControl<TypeServiceParc>('DIRECTION', { nonNullable: true, validators: [Validators.required] })
  });

  page: PageResponse<ServiceParcListe> = this.pageVide();
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
    this.recherche.valueChanges.pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => this.charger(0));
    this.typeFiltre.valueChanges.pipe(distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => this.charger(0));
    this.statutFiltre.valueChanges.pipe(distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => this.charger(0));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  charger(numeroPage = this.page.page): void {
    this.chargement = true;
    this.erreur = '';
    this.service.rechercher(this.recherche.value.trim(), this.typeFiltre.value, this.statutFiltre.value, numeroPage).subscribe({
      next: résultat => { this.page = résultat; this.chargement = false; },
      error: erreur => { this.erreur = this.messageErreur(erreur); this.chargement = false; }
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
        this.toast.show('error', 'Enregistrement impossible', this.messageErreur(erreur));
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
        this.toast.show('error', 'Consultation impossible', this.messageErreur(erreur));
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
        this.toast.show('error', 'Changement de statut impossible', this.messageErreur(erreur));
      }
    });
  }

  libelleType(type: TypeServiceParc): string {
    return type === 'DIRECTION' ? 'Direction' : 'Parc commun';
  }

  get historique(): ActivityItem[] {
    return (this.selection?.historique ?? []).map(evenement => ({
      label: ({ CREATION: 'Création', MODIFICATION: 'Modification', ACTIVATION: 'Activation', DESACTIVATION: 'Désactivation' } as const)[evenement.action],
      date: evenement.dateEvenement,
      user: evenement.utilisateur,
      tone: evenement.action === 'DESACTIVATION' ? 'red' : evenement.action === 'MODIFICATION' ? 'gold' : 'green'
    }));
  }

  identifier(_index: number, serviceParc: ServiceParcListe): string { return serviceParc.code; }

  private messageErreur(erreur: unknown): string {
    if (erreur instanceof HttpErrorResponse) {
      const problème = erreur.error as ApiProblem | null;
      return problème?.detail || (erreur.status === 0 ? 'Le serveur est inaccessible.' : 'Une erreur inattendue est survenue.');
    }
    return 'Une erreur inattendue est survenue.';
  }

  private pageVide(): PageResponse<ServiceParcListe> {
    return { contenu: [], page: 0, taille: 10, totalElements: 0, totalPages: 0, premiere: true, derniere: true };
  }
}
