
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormFieldComponent } from '../../../shared/ui/form-field/form-field.component';
import { FormModalComponent } from '../../../shared/ui/form-modal/form-modal.component';
import { dateLocaleIso } from '../../../shared/utils/date-locale';
import {
  Affectation, AffectationOptions, AffectationPayload
} from '../../models/affectation.models';

@Component({
    selector: 'app-affectation-form-modal',
    imports: [ReactiveFormsModule, FormFieldComponent, FormModalComponent],
    templateUrl: './affectation-form-modal.component.html',
    styleUrls: ['./affectation-form-modal.component.css']
})
export class AffectationFormModalComponent implements OnChanges {
  @Input() open = false;
  @Input() options: AffectationOptions = { vehicules: [], servicesParcs: [], conducteurs: [] };
  @Input() affectation: Affectation | null = null;
  @Input() saving = false;
  @Output() closed = new EventEmitter<void>();
  @Output() submitted = new EventEmitter<AffectationPayload>();

  readonly today = dateLocaleIso();
  readonly form = new FormGroup({
    vehiculeId: new FormControl('', { nonNullable: true, validators: Validators.required }),
    serviceParcId: new FormControl('', { nonNullable: true, validators: Validators.required }),
    conducteurId: new FormControl('', { nonNullable: true, validators: Validators.required }),
    dateDebut: new FormControl(this.today, { nonNullable: true, validators: Validators.required }),
    motif: new FormControl('', {
      nonNullable: true, validators: [Validators.required, Validators.maxLength(500)]
    }),
    dateFinPrevue: new FormControl<string | null>(null),
    typeMission: new FormControl<string | null>(null, Validators.maxLength(200))
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['open'] || !this.open) return;
    this.form.reset({
      vehiculeId: this.affectation?.vehiculeId ?? '',
      serviceParcId: this.affectation?.serviceParcId ?? '',
      conducteurId: this.affectation?.conducteurId ?? '',
      dateDebut: this.today,
      motif: '',
      dateFinPrevue: null,
      typeMission: null
    });
  }

  submit(): void {
    this.form.controls.dateFinPrevue.setValidators(
      this.missionActive ? Validators.required : []);
    this.form.controls.typeMission.setValidators(
      this.missionActive
        ? [Validators.required, Validators.maxLength(200)]
        : Validators.maxLength(200));
    if (!this.missionActive) {
      this.form.patchValue({ dateFinPrevue: null, typeMission: null });
    }
    this.form.controls.dateFinPrevue.updateValueAndValidity();
    this.form.controls.typeMission.updateValueAndValidity();
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitted.emit(this.form.getRawValue());
  }

  get missionActive(): boolean {
    const serviceId = this.form.controls.serviceParcId.value;
    const conducteurDesigne = !!this.form.controls.conducteurId.value;
    return conducteurDesigne && this.options.servicesParcs.some(
      service => service.id === serviceId && service.parcMission);
  }
}
