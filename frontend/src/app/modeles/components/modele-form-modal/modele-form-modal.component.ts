
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DynamicTextListComponent } from '../../../shared/ui/dynamic-text-list/dynamic-text-list.component';
import { FormFieldComponent } from '../../../shared/ui/form-field/form-field.component';
import { FormModalComponent } from '../../../shared/ui/form-modal/form-modal.component';
import { MarqueOption } from '../../../marques/models/marque.models';
import { nettoyerListeTexte } from '../../../shared/utils/text-list';

export type ModeleFormMode = 'create' | 'edit';

export interface ModeleFormValue {
  marqueCode: string;
  noms: string[];
}

@Component({
    selector: 'app-modele-form-modal',
    imports: [
    ReactiveFormsModule,
    DynamicTextListComponent,
    FormFieldComponent,
    FormModalComponent
],
    templateUrl: './modele-form-modal.component.html'
})
export class ModeleFormModalComponent implements OnChanges {
  @Input() open = false;
  @Input() mode: ModeleFormMode = 'create';
  @Input() saving = false;
  @Input() marques: MarqueOption[] = [];
  @Input() marqueCode = '';
  @Input() modeleNom = '';
  @Input() lockMarque = false;
  @Output() closed = new EventEmitter<void>();
  @Output() submitted = new EventEmitter<ModeleFormValue>();

  readonly form = new FormGroup({
    marqueCode: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    nom: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(80)]
    }),
    noms: new FormArray<FormControl<string>>([])
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['open'] && this.open) {
      this.form.controls.marqueCode.reset(this.marqueCode);
      this.form.controls.nom.reset(this.modeleNom);
      this.form.controls.noms.clear();
    }
  }

  submit(): void {
    if (this.mode === 'edit') {
      if (this.form.controls.nom.invalid) {
        this.form.controls.nom.markAsTouched();
        return;
      }
      this.submitted.emit({
        marqueCode: this.marqueCode,
        noms: [this.form.controls.nom.value.trim()]
      });
      return;
    }

    const noms = nettoyerListeTexte(this.form.controls.noms.getRawValue());
    if (this.form.controls.marqueCode.invalid || !noms.length) {
      this.form.controls.marqueCode.markAsTouched();
      if (!noms.length) {
        const premierNom = this.form.controls.noms.at(0);
        premierNom?.setErrors({ required: true });
        premierNom?.markAsTouched();
      }
      return;
    }
    this.submitted.emit({
      marqueCode: this.form.controls.marqueCode.value,
      noms
    });
  }

}
