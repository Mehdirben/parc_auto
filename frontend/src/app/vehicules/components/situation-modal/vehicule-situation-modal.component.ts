
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ToastService } from '../../../core/toast.service';
import { FormFieldComponent } from '../../../shared/ui/form-field/form-field.component';
import { FormModalComponent } from '../../../shared/ui/form-modal/form-modal.component';
import { InformationNoticeComponent } from '../../../shared/ui/information-notice/information-notice.component';
import { apiErrorMessage } from '../../../shared/utils/api-error';
import { EtatGeneral, StatutVehicule, VehiculeDetail } from '../../models/vehicule.models';
import { VehiculeService } from '../../data-access/vehicule.service';

@Component({
    selector: 'app-vehicule-situation-modal',
    imports: [ReactiveFormsModule, FormFieldComponent, FormModalComponent, InformationNoticeComponent],
    templateUrl: './vehicule-situation-modal.component.html',
})
export class VehiculeSituationModalComponent implements OnChanges {
  private readonly service = inject(VehiculeService);
  private readonly toast = inject(ToastService);

  @Input() open = false;
  @Input() vehicule: VehiculeDetail | null = null;
  @Output() closed = new EventEmitter<void>();
  @Output() updated = new EventEmitter<VehiculeDetail>();

  readonly form = new FormGroup({
    statut: new FormControl<StatutVehicule>('DISPONIBLE', { nonNullable: true }),
    etatGeneral: new FormControl<EtatGeneral>('BON_ETAT', { nonNullable: true })
  });
  enregistrement = false;

  ngOnChanges(changes: SimpleChanges): void {
    if ((changes['open'] || changes['vehicule']) && this.open && this.vehicule) {
      this.form.reset({
        statut: this.vehicule.statut,
        etatGeneral: this.vehicule.etatGeneral
      });
    }
  }

  enregistrer(): void {
    if (!this.vehicule) return;
    const valeur = this.form.getRawValue();
    this.enregistrement = true;
    this.service.modifierSituation(this.vehicule.code, valeur.statut, valeur.etatGeneral).subscribe({
      next: detail => {
        this.enregistrement = false;
        this.toast.show('success', 'Situation du véhicule mise à jour');
        this.updated.emit(detail);
      },
      error: erreur => {
        this.enregistrement = false;
        this.toast.show('error', 'Modification impossible', apiErrorMessage(erreur));
      }
    });
  }
}
