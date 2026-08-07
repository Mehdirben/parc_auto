import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastService } from '../../../core/toast.service';
import { FormFieldComponent } from '../../../shared/ui/form-field/form-field.component';
import { FormModalComponent } from '../../../shared/ui/form-modal/form-modal.component';
import { apiErrorMessage } from '../../../shared/utils/api-error';
import { dateLocaleIso } from '../../../shared/utils/date-locale';
import { VehiculeService } from '../../data-access/vehicule.service';
import { SourceReleve, VehiculeDetail } from '../../models/vehicule.models';
import { libelleSourceReleve } from '../../utils/vehicule-labels';

@Component({
    selector: 'app-vehicule-kilometrage',
    imports: [CommonModule, ReactiveFormsModule, FormFieldComponent, FormModalComponent],
    templateUrl: './vehicule-kilometrage.component.html',
    styleUrls: ['../../styles/vehicule-tabs.css']
})
export class VehiculeKilometrageComponent {
  private readonly service = inject(VehiculeService);
  private readonly toast = inject(ToastService);

  @Input({ required: true }) vehicule!: VehiculeDetail;
  @Input() lectureSeule = false;
  @Output() updated = new EventEmitter<VehiculeDetail>();

  readonly aujourdHui = dateLocaleIso();
  readonly libelleSource = libelleSourceReleve;
  readonly form = new FormGroup({
    date: new FormControl(this.aujourdHui, { nonNullable: true, validators: [Validators.required] }),
    kilometrage: new FormControl<number | null>(null, { validators: [Validators.required, Validators.min(0)] }),
    source: new FormControl<SourceReleve>('SAISIE_MANUELLE', { nonNullable: true }),
    commentaire: new FormControl('', { nonNullable: true, validators: [Validators.maxLength(80)] })
  });
  modalOuverte = false;
  enregistrement = false;

  ouvrir(): void {
    this.form.reset({
      date: this.aujourdHui,
      kilometrage: null,
      source: 'SAISIE_MANUELLE',
      commentaire: ''
    });
    this.modalOuverte = true;
  }

  enregistrer(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const valeur = this.form.getRawValue();
    this.enregistrement = true;
    this.service.ajouterReleve(
      this.vehicule.code, valeur.date, valeur.kilometrage!, valeur.source, valeur.commentaire
    ).subscribe({
      next: detail => {
        this.enregistrement = false;
        this.modalOuverte = false;
        this.toast.show('success', 'Relevé kilométrique ajouté');
        this.updated.emit(detail);
      },
      error: erreur => {
        this.enregistrement = false;
        this.toast.show('error', 'Ajout impossible', apiErrorMessage(erreur));
      }
    });
  }
}
