import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ToastService } from '../../../core/toast.service';
import { PermissionService } from '../../../core/permission.service';
import { PageResponse } from '../../../shared/models/api.models';
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
import { apiErrorMessage } from '../../../shared/utils/api-error';
import { versElementsTimeline } from '../../../shared/utils/audit-timeline';
import { dateLocaleIso } from '../../../shared/utils/date-locale';
import { emptyPage } from '../../../shared/utils/empty-page';
import { lierFiltresListe } from '../../../shared/utils/list-filters';
import { ConducteurService } from '../../data-access/conducteur.service';
import {
  ActionConducteur,
  ConducteurDetail,
  ConducteurListe,
  ConducteurStatistiques,
  FiltrePermis
} from '../../models/conducteur.models';

type DialogMode = 'create' | 'edit';
type StatutFiltre = '' | 'actif' | 'inactif';
const TELEPHONE_MAROCAIN = /^(?:\+212|0)[5-7][0-9]{8}$/;
const permisValide = (control: AbstractControl<string>): ValidationErrors | null =>
  control.value && control.value < dateLocaleIso() ? { permisExpire: true } : null;
const LIBELLES_ACTIONS: Record<ActionConducteur, string> = {
  CREATION: 'Création',
  MODIFICATION: 'Modification',
  ACTIVATION: 'Activation',
  DESACTIVATION: 'Désactivation'
};

@Component({
    selector: 'app-conducteurs',
    imports: [
        CommonModule, ReactiveFormsModule, ActivityTimelineComponent, AuditTrailComponent,
        ConfirmDialogComponent, DataTableComponent, DetailModalComponent, EmptyStateComponent,
        FormFieldComponent, FormModalComponent, PageHeaderComponent, PaginationComponent,
        SearchToolbarComponent, SummaryCardComponent, TableActionComponent, TableLoadingComponent
    ],
    templateUrl: './conducteurs.component.html',
    styleUrls: ['../../../shared/styles/entity-list.css', '../../../shared/styles/detail-identity.css', './conducteurs.component.css']
})
export class ConducteursComponent implements OnInit {
  readonly permissions = inject(PermissionService);
  private readonly service = inject(ConducteurService);
  private readonly toast = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly route = inject(ActivatedRoute);

  readonly peopleIcon = APP_ICONS.conducteur;
  readonly activeIcon = APP_ICONS.actif;
  readonly permitIcon = APP_ICONS.permis;

  readonly recherche = new FormControl('', { nonNullable: true });
  readonly statutFiltre = new FormControl<StatutFiltre>('', { nonNullable: true });
  readonly permisFiltre = new FormControl<FiltrePermis | ''>('', { nonNullable: true });
  readonly aujourdHui = dateLocaleIso();
  readonly formulaire = new FormGroup({
    matricule: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(20)]
    }),
    nomComplet: new FormControl('', {
      nonNullable: true, validators: [Validators.required, Validators.maxLength(80)]
    }),
    telephone: new FormControl('', {
      nonNullable: true, validators: [Validators.pattern(TELEPHONE_MAROCAIN)]
    }),
    numeroPermis: new FormControl('', {
      nonNullable: true, validators: [Validators.required, Validators.maxLength(50)]
    }),
    dateValiditePermis: new FormControl('', {
      nonNullable: true, validators: [Validators.required, permisValide]
    })
  });

  page: PageResponse<ConducteurListe> = emptyPage();
  statistiques: ConducteurStatistiques = {
    total: 0, actifs: 0, inactifs: 0, permisExpires: 0, permisExpirantBientot: 0
  };
  selection: ConducteurDetail | null = null;
  cibleStatut: ConducteurListe | ConducteurDetail | null = null;
  conducteurModifié: ConducteurListe | ConducteurDetail | null = null;
  chargement = true;
  chargementDetail = false;
  enregistrement = false;
  erreur = '';
  dialogueOuvert = false;
  dialogueMode: DialogMode = 'create';

  ngOnInit(): void {
    const permis = this.route.snapshot.queryParamMap.get('permis');
    if (permis === 'EXPIRE' || permis === 'A_RENOUVELER') {
      this.permisFiltre.setValue(permis, { emitEvent: false });
    }
    this.charger();
    lierFiltresListe(this.destroyRef, [
      { control: this.recherche, debounce: 300 },
      { control: this.statutFiltre },
      { control: this.permisFiltre }
    ], () => this.charger(0));
  }

  charger(numeroPage = this.page.page): void {
    this.chargement = true;
    this.erreur = '';
    this.service.rechercher(
      this.recherche.value.trim(), this.statutFiltre.value,
      this.permisFiltre.value, numeroPage
    ).subscribe({
      next: résultat => { this.page = résultat; this.chargement = false; },
      error: erreur => { this.erreur = apiErrorMessage(erreur); this.chargement = false; }
    });
    this.service.statistiques().subscribe({ next: résultat => this.statistiques = résultat });
  }

  ouvrirCreation(): void {
    this.dialogueMode = 'create';
    this.conducteurModifié = null;
    this.formulaire.reset({
      matricule: '', nomComplet: '', telephone: '', numeroPermis: '', dateValiditePermis: ''
    });
    this.dialogueOuvert = true;
  }

  ouvrirModification(conducteur: ConducteurListe | ConducteurDetail): void {
    this.dialogueMode = 'edit';
    this.conducteurModifié = conducteur;
    this.formulaire.reset({
      matricule: conducteur.matricule,
      nomComplet: conducteur.nomComplet,
      telephone: conducteur.telephone ?? '',
      numeroPermis: conducteur.numeroPermis,
      dateValiditePermis: conducteur.dateValiditePermis
    });
    this.dialogueOuvert = true;
  }

  enregistrer(): void {
    if (this.formulaire.invalid) {
      this.formulaire.markAllAsTouched();
      return;
    }
    const payload = this.formulaire.getRawValue();
    this.enregistrement = true;
    const requête = this.dialogueMode === 'create'
      ? this.service.créer(payload)
      : this.service.modifier(this.conducteurModifié!.matricule, payload);
    requête.subscribe({
      next: résultat => {
        this.enregistrement = false;
        this.dialogueOuvert = false;
        if (this.selection?.matricule === this.conducteurModifié?.matricule) this.selection = résultat;
        this.toast.show('success', this.dialogueMode === 'create' ? 'Conducteur créé' : 'Conducteur modifié');
        this.charger(this.page.page);
      },
      error: erreur => {
        this.enregistrement = false;
        this.toast.show('error', 'Enregistrement impossible', apiErrorMessage(erreur));
      }
    });
  }

  consulter(conducteur: ConducteurListe): void {
    this.selection = null;
    this.chargementDetail = true;
    this.service.consulter(conducteur.matricule).subscribe({
      next: détail => { this.selection = détail; this.chargementDetail = false; },
      error: erreur => {
        this.chargementDetail = false;
        this.toast.show('error', 'Consultation impossible', apiErrorMessage(erreur));
      }
    });
  }

  demanderChangementStatut(conducteur: ConducteurListe | ConducteurDetail): void {
    this.cibleStatut = conducteur;
  }

  confirmerChangementStatut(): void {
    if (!this.cibleStatut) return;
    const cible = this.cibleStatut;
    this.enregistrement = true;
    this.service.changerStatut(cible.matricule, !cible.actif).subscribe({
      next: résultat => {
        this.enregistrement = false;
        this.cibleStatut = null;
        if (this.selection?.matricule === cible.matricule) this.selection = résultat;
        this.toast.show('success', résultat.actif ? 'Conducteur activé' : 'Conducteur désactivé');
        this.charger(this.page.page);
      },
      error: erreur => {
        this.enregistrement = false;
        this.cibleStatut = null;
        this.toast.show('error', 'Changement de statut impossible', apiErrorMessage(erreur));
      }
    });
  }

  permisExpire(date: string): boolean {
    return date < this.aujourdHui;
  }

  get historique(): ActivityItem[] {
    return versElementsTimeline(
      this.selection?.historique ?? [],
      LIBELLES_ACTIONS,
      action => action === 'DESACTIVATION' ? 'red' : action === 'MODIFICATION' ? 'gold' : 'green'
    );
  }

  identifier(_index: number, conducteur: ConducteurListe): string {
    return conducteur.matricule;
  }

}
