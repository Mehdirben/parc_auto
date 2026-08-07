
import {
  Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges, inject
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { ToastService } from '../../../core/toast.service';
import { MarqueService } from '../../../marques/data-access/marque.service';
import { MarqueOption } from '../../../marques/models/marque.models';
import { Modele } from '../../../modeles/models/modele.models';
import { FormFieldComponent } from '../../../shared/ui/form-field/form-field.component';
import { FormModalComponent } from '../../../shared/ui/form-modal/form-modal.component';
import { apiErrorMessage } from '../../../shared/utils/api-error';
import { dateLocaleIso } from '../../../shared/utils/date-locale';
import {
  Carburant, CreerVehiculePayload, EtatGeneral, GenreVehicule,
  StatutVehicule, VehiculeDetail
} from '../../models/vehicule.models';
import { VehiculeService } from '../../data-access/vehicule.service';
import {
  IMMATRICULATION_MAROCAINE,
  normaliserImmatriculation
} from '../../utils/immatriculation-marocaine';

@Component({
    selector: 'app-vehicule-creation-modal',
    imports: [ReactiveFormsModule, FormFieldComponent, FormModalComponent],
    templateUrl: './vehicule-creation-modal.component.html'
})
export class VehiculeCreationModalComponent implements OnChanges, OnDestroy {
  private readonly service = inject(VehiculeService);
  private readonly marquesService = inject(MarqueService);
  private readonly toast = inject(ToastService);
  private readonly destroy$ = new Subject<void>();

  @Input() open = false;
  @Input() marques: MarqueOption[] = [];
  @Output() closed = new EventEmitter<void>();
  @Output() created = new EventEmitter<VehiculeDetail>();

  readonly aujourdHui = dateLocaleIso();
  readonly form = new FormGroup({
    immatriculation: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.maxLength(50),
        Validators.pattern(IMMATRICULATION_MAROCAINE)
      ]
    }),
    ancienneImmatriculation: new FormControl('', { nonNullable: true, validators: [Validators.maxLength(50)] }),
    marqueCode: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    modeleId: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    genre: new FormControl<GenreVehicule>('VOITURE_TOURISME', { nonNullable: true, validators: [Validators.required] }),
    vin: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(50)] }),
    carburant: new FormControl<Carburant>('DIESEL', { nonNullable: true, validators: [Validators.required] }),
    nombreCylindres: new FormControl<number | null>(null, { validators: [Validators.min(1)] }),
    puissanceFiscale: new FormControl<number | null>(null, { validators: [Validators.required, Validators.min(1)] }),
    poidsVide: new FormControl<number | null>(null, { validators: [Validators.min(0.01)] }),
    poidsTotalCharge: new FormControl<number | null>(null, { validators: [Validators.min(0.01)] }),
    kilometrageInitial: new FormControl<number | null>(0, { validators: [Validators.required, Validators.min(0)] }),
    datePremiereMiseCirculation: new FormControl('', { nonNullable: true }),
    dateMutation: new FormControl('', { nonNullable: true }),
    statut: new FormControl<StatutVehicule>('DISPONIBLE', { nonNullable: true, validators: [Validators.required] }),
    etatGeneral: new FormControl<EtatGeneral>('BON_ETAT', { nonNullable: true, validators: [Validators.required] })
  });

  modeles: Modele[] = [];
  enregistrement = false;

  constructor() {
    this.form.controls.marqueCode.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe(code => this.chargerModeles(code));
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['open']?.currentValue && !changes['open'].previousValue) {
      this.reinitialiser();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  enregistrer(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const valeur = this.form.getRawValue();
    const payload: CreerVehiculePayload = {
      immatriculation: normaliserImmatriculation(valeur.immatriculation),
      ancienneImmatriculation: normaliserImmatriculation(valeur.ancienneImmatriculation),
      modeleId: valeur.modeleId,
      genre: valeur.genre,
      vin: valeur.vin.trim().toUpperCase(),
      carburant: valeur.carburant,
      nombreCylindres: valeur.nombreCylindres,
      puissanceFiscale: valeur.puissanceFiscale!,
      poidsVide: valeur.poidsVide,
      poidsTotalCharge: valeur.poidsTotalCharge,
      kilometrageInitial: valeur.kilometrageInitial!,
      datePremiereMiseCirculation: valeur.datePremiereMiseCirculation || null,
      dateMutation: valeur.dateMutation || null,
      statut: valeur.statut,
      etatGeneral: valeur.etatGeneral
    };
    this.enregistrement = true;
    this.service.créer(payload).subscribe({
      next: vehicule => {
        this.enregistrement = false;
        this.toast.show('success', 'Véhicule créé', `Code interne ${vehicule.code}`);
        this.created.emit(vehicule);
      },
      error: erreur => {
        this.enregistrement = false;
        this.toast.show('error', 'Création impossible', apiErrorMessage(erreur));
      }
    });
  }

  private reinitialiser(): void {
    this.form.reset({
      immatriculation: '', ancienneImmatriculation: '', marqueCode: '', modeleId: '',
      genre: 'VOITURE_TOURISME', vin: '', carburant: 'DIESEL',
      nombreCylindres: null, puissanceFiscale: null, poidsVide: null,
      poidsTotalCharge: null, kilometrageInitial: 0,
      datePremiereMiseCirculation: '', dateMutation: '',
      statut: 'DISPONIBLE', etatGeneral: 'BON_ETAT'
    });
    this.modeles = [];
  }

  private chargerModeles(code: string): void {
    this.modeles = [];
    this.form.controls.modeleId.setValue('', { emitEvent: false });
    if (!code) return;
    this.marquesService.consulter(code).subscribe({
      next: marque => this.modeles = marque.modeles,
      error: () => this.toast.show('error', 'Référentiel indisponible', 'Impossible de charger les modèles.')
    });
  }
}
