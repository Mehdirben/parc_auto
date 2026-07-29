import { CommonModule } from "@angular/common";
import { HttpErrorResponse } from "@angular/common/http";
import { Component, OnDestroy, OnInit, inject } from "@angular/core";
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from "rxjs";
import { ToastService } from "../../core/toast.service";
import {
  ActivityItem,
  ActivityTimelineComponent,
} from "../../shared/ui/activity-timeline/activity-timeline.component";
import { AuditTrailComponent } from "../../shared/ui/audit-trail/audit-trail.component";
import { ConfirmDialogComponent } from "../../shared/ui/confirm-dialog/confirm-dialog.component";
import { DataTableComponent } from "../../shared/ui/data-table/data-table.component";
import { DetailDrawerComponent } from "../../shared/ui/detail-drawer/detail-drawer.component";
import { EmptyStateComponent } from "../../shared/ui/empty-state/empty-state.component";
import { FormFieldComponent } from "../../shared/ui/form-field/form-field.component";
import { FormModalComponent } from "../../shared/ui/form-modal/form-modal.component";
import { PageHeaderComponent } from "../../shared/ui/page-header/page-header.component";
import { PaginationComponent } from "../../shared/ui/pagination/pagination.component";
import { SearchToolbarComponent } from "../../shared/ui/search-toolbar/search-toolbar.component";
import { SummaryCardComponent } from "../../shared/ui/summary-card/summary-card.component";
import { TableActionComponent } from "../../shared/ui/table-action/table-action.component";
import { TableLoadingComponent } from "../../shared/ui/table-loading/table-loading.component";
import {
  ApiProblem,
  ConducteurDetail,
  ConducteurListe,
  ConducteurStatistiques,
  PageResponse,
} from "./conducteur.models";
import { ConducteurService } from "./conducteur.service";

type DialogMode = "create" | "edit";
type StatutFiltre = "" | "actif" | "inactif";

@Component({
  selector: "app-conducteurs",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ActivityTimelineComponent,
    AuditTrailComponent,
    ConfirmDialogComponent,
    DataTableComponent,
    DetailDrawerComponent,
    EmptyStateComponent,
    FormFieldComponent,
    FormModalComponent,
    PageHeaderComponent,
    PaginationComponent,
    SearchToolbarComponent,
    SummaryCardComponent,
    TableActionComponent,
    TableLoadingComponent,
  ],
  templateUrl: "./conducteurs.component.html",
  styleUrls: ["./conducteurs.component.css"],
})
export class ConducteursComponent implements OnInit, OnDestroy {
  private readonly service = inject(ConducteurService);
  private readonly toast = inject(ToastService);
  private readonly destroy$ = new Subject<void>();

  readonly conducteurIcon =
    "M12 2C8 2 6 4 6 8s4 6 6 6 6-2 6-6-2-6-6-6Zm0 14c-4 0-8 2-8 4v2h16v-2c0-2-4-4-8-4Z";
  readonly activeIcon =
    "M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17Z";
  readonly inactiveIcon =
    "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2Zm0 18c-4.42 0-8-3.58-8-8 0-1.85.63-3.55 1.69-4.9L16.9 18.31A7.902 7.902 0 0 1 12 20Zm6.31-3.1L7.1 5.69A7.902 7.902 0 0 1 12 4c4.42 0 8 3.58 8 8 0 1.85-.63 3.55-1.69 4.9Z";

  readonly recherche = new FormControl("", { nonNullable: true });
  readonly statutFiltre = new FormControl<StatutFiltre>("", {
    nonNullable: true,
  });
  readonly formulaire = new FormGroup({
    matricule: new FormControl("", {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(20)],
    }),
    nomComplet: new FormControl("", {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(80)],
    }),
    telephone: new FormControl("", {
      nonNullable: true,
      validators: [Validators.maxLength(20)],
    }),
    numeroPermis: new FormControl("", {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(50)],
    }),
    dateValiditePermis: new FormControl("", {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  page: PageResponse<ConducteurListe> = this.pageVide();
  statistiques: ConducteurStatistiques = { total: 0, actifs: 0, inactifs: 0 };
  selection: ConducteurDetail | null = null;
  cibleStatut: ConducteurListe | ConducteurDetail | null = null;
  chargement = true;
  chargementDetail = false;
  enregistrement = false;
  erreur = "";
  dialogueOuvert = false;
  dialogueMode: DialogMode = "create";
  conducteurModifié: ConducteurListe | ConducteurDetail | null = null;

  ngOnInit(): void {
    this.charger();
    this.recherche.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => this.charger(0));
    this.statutFiltre.valueChanges
      .pipe(distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => this.charger(0));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  charger(numeroPage = this.page.page): void {
    this.chargement = true;
    this.erreur = "";
    this.service
      .rechercher(
        this.recherche.value.trim(),
        this.statutFiltre.value,
        numeroPage,
      )
      .subscribe({
        next: (résultat) => {
          this.page = résultat;
          this.chargement = false;
        },
        error: (erreur) => {
          this.erreur = this.messageErreur(erreur);
          this.chargement = false;
        },
      });
    this.service
      .statistiques()
      .subscribe({ next: (résultat) => (this.statistiques = résultat) });
  }

  ouvrirCreation(): void {
    this.dialogueMode = "create";
    this.conducteurModifié = null;
    this.formulaire.reset({
      matricule: "",
      nomComplet: "",
      telephone: "",
      numeroPermis: "",
      dateValiditePermis: "",
    });
    this.dialogueOuvert = true;
  }

  ouvrirModification(conducteur: ConducteurListe | ConducteurDetail): void {
    this.dialogueMode = "edit";
    this.conducteurModifié = conducteur;
    this.formulaire.reset({
      matricule: conducteur.matricule,
      nomComplet: conducteur.nomComplet,
      telephone: conducteur.telephone || "",
      numeroPermis: conducteur.numeroPermis,
      dateValiditePermis: conducteur.dateValiditePermis,
    });
    this.dialogueOuvert = true;
  }

  enregistrer(): void {
    if (this.formulaire.invalid) {
      this.formulaire.markAllAsTouched();
      return;
    }
    const valeur = this.formulaire.getRawValue();
    const telephone = valeur.telephone?.trim() || null;
    this.enregistrement = true;
    const requête =
      this.dialogueMode === "create"
        ? this.service.créer(
            valeur.matricule,
            valeur.nomComplet,
            telephone,
            valeur.numeroPermis,
            valeur.dateValiditePermis,
          )
        : this.service.modifier(
            this.conducteurModifié!.matricule,
            valeur.matricule,
            valeur.nomComplet,
            telephone,
            valeur.numeroPermis,
            valeur.dateValiditePermis,
          );
    requête.subscribe({
      next: (résultat) => {
        this.enregistrement = false;
        this.dialogueOuvert = false;
        if (this.selection?.matricule === this.conducteurModifié?.matricule)
          this.selection = résultat;
        this.toast.show(
          "success",
          this.dialogueMode === "create"
            ? "Conducteur créé"
            : "Conducteur modifié",
        );
        this.charger(this.page.page);
      },
      error: (erreur) => {
        this.enregistrement = false;
        this.toast.show(
          "error",
          "Enregistrement impossible",
          this.messageErreur(erreur),
        );
      },
    });
  }

  consulter(conducteur: ConducteurListe): void {
    this.selection = null;
    this.chargementDetail = true;
    this.service.consulter(conducteur.matricule).subscribe({
      next: (détail) => {
        this.selection = détail;
        this.chargementDetail = false;
      },
      error: (erreur) => {
        this.chargementDetail = false;
        this.toast.show(
          "error",
          "Consultation impossible",
          this.messageErreur(erreur),
        );
      },
    });
  }

  demanderChangementStatut(
    conducteur: ConducteurListe | ConducteurDetail,
  ): void {
    this.cibleStatut = conducteur;
  }

  confirmerChangementStatut(): void {
    if (!this.cibleStatut) return;
    const cible = this.cibleStatut;
    this.enregistrement = true;
    this.service.changerStatut(cible.matricule, !cible.actif).subscribe({
      next: (résultat) => {
        this.enregistrement = false;
        this.cibleStatut = null;
        if (this.selection?.matricule === cible.matricule)
          this.selection = résultat;
        this.toast.show(
          "success",
          résultat.actif ? "Conducteur activé" : "Conducteur désactivé",
        );
        this.charger(this.page.page);
      },
      error: (erreur) => {
        this.enregistrement = false;
        this.cibleStatut = null;
        this.toast.show(
          "error",
          "Changement de statut impossible",
          this.messageErreur(erreur),
        );
      },
    });
  }

  get historique(): ActivityItem[] {
    return (this.selection?.historique ?? []).map((evenement) => ({
      label: (
        {
          CREATION: "Création",
          MODIFICATION: "Modification",
          ACTIVATION: "Activation",
          DESACTIVATION: "Désactivation",
        } as const
      )[evenement.action],
      date: evenement.dateEvenement,
      user: evenement.utilisateur,
      tone:
        evenement.action === "DESACTIVATION"
          ? "red"
          : evenement.action === "MODIFICATION"
            ? "gold"
            : "green",
    }));
  }

  identifier(_index: number, conducteur: ConducteurListe): string {
    return conducteur.matricule;
  }

  private messageErreur(erreur: unknown): string {
    if (erreur instanceof HttpErrorResponse) {
      const problème = erreur.error as ApiProblem | null;
      return (
        problème?.detail ||
        (erreur.status === 0
          ? "Le serveur est inaccessible."
          : "Une erreur inattendue est survenue.")
      );
    }
    return "Une erreur inattendue est survenue.";
  }

  private pageVide(): PageResponse<ConducteurListe> {
    return {
      contenu: [],
      page: 0,
      taille: 10,
      totalElements: 0,
      totalPages: 0,
      premiere: true,
      derniere: true,
    };
  }
}
