
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormFieldComponent } from '../../../shared/ui/form-field/form-field.component';
import { FormModalComponent } from '../../../shared/ui/form-modal/form-modal.component';
import { dateLocaleIso } from '../../../shared/utils/date-locale';
import { Affectation } from '../../models/affectation.models';

@Component({
    selector: 'app-restitution-modal',
    imports: [ReactiveFormsModule, FormFieldComponent, FormModalComponent],
    templateUrl: './restitution-modal.component.html'
})
export class RestitutionModalComponent implements OnChanges {
  @Input() affectation: Affectation | null = null;
  @Input() saving = false;
  @Output() closed = new EventEmitter<void>();
  @Output() submitted = new EventEmitter<{ dateRestitution: string; motif: string }>();
  readonly today = dateLocaleIso();
  readonly form = new FormGroup({
    dateRestitution: new FormControl(this.today, { nonNullable: true, validators: Validators.required }),
    motif: new FormControl('', {
      nonNullable: true, validators: [Validators.required, Validators.maxLength(500)]
    })
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['affectation'] && this.affectation) {
      this.form.reset({ dateRestitution: this.today, motif: '' });
    }
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitted.emit(this.form.getRawValue());
  }
}
