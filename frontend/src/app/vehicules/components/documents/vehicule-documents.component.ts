import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, Output, ViewChild, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ToastService } from '../../../core/toast.service';
import { ConfirmDialogComponent } from '../../../shared/ui/confirm-dialog/confirm-dialog.component';
import { FormFieldComponent } from '../../../shared/ui/form-field/form-field.component';
import { FormModalComponent } from '../../../shared/ui/form-modal/form-modal.component';
import { apiErrorMessage } from '../../../shared/utils/api-error';
import { VehiculeService } from '../../data-access/vehicule.service';
import { PieceJointeVehicule, TypePieceJointe, VehiculeDetail } from '../../models/vehicule.models';
import { libellePieceVehicule } from '../../utils/vehicule-labels';

@Component({
    selector: 'app-vehicule-documents',
    imports: [
        CommonModule, ReactiveFormsModule, ConfirmDialogComponent,
        FormFieldComponent, FormModalComponent
    ],
    templateUrl: './vehicule-documents.component.html',
    styleUrls: ['../../styles/vehicule-tabs.css', './vehicule-documents.component.css']
})
export class VehiculeDocumentsComponent {
  private readonly service = inject(VehiculeService);
  private readonly toast = inject(ToastService);

  @Input({ required: true }) vehicule!: VehiculeDetail;
  @Input() lectureSeule = false;
  @Output() updated = new EventEmitter<VehiculeDetail>();
  @ViewChild('fichierInput') fichierInput?: ElementRef<HTMLInputElement>;

  readonly libellePiece = libellePieceVehicule;
  readonly form = new FormGroup({
    typePiece: new FormControl<TypePieceJointe>('CARTE_GRISE', { nonNullable: true })
  });
  modalOuverte = false;
  enregistrement = false;
  fichier: File | null = null;
  pieceASupprimer: PieceJointeVehicule | null = null;

  ouvrir(): void {
    this.form.reset({ typePiece: 'CARTE_GRISE' });
    this.fichier = null;
    if (this.fichierInput) this.fichierInput.nativeElement.value = '';
    this.modalOuverte = true;
  }

  choisirFichier(event: Event): void {
    this.fichier = (event.target as HTMLInputElement).files?.[0] ?? null;
  }

  enregistrer(): void {
    if (!this.fichier) {
      this.toast.show('error', 'Fichier obligatoire', 'Sélectionnez un fichier PDF, JPEG ou PNG.');
      return;
    }
    this.enregistrement = true;
    this.service.ajouterPiece(
      this.vehicule.code, this.form.controls.typePiece.value, this.fichier
    ).subscribe({
      next: detail => {
        this.enregistrement = false;
        this.modalOuverte = false;
        this.toast.show('success', 'Pièce jointe ajoutée');
        this.updated.emit(detail);
      },
      error: erreur => {
        this.enregistrement = false;
        this.toast.show('error', 'Ajout impossible', apiErrorMessage(erreur));
      }
    });
  }

  telecharger(piece: PieceJointeVehicule): void {
    this.service.téléchargerPiece(this.vehicule.code, piece.id).subscribe({
      next: contenu => {
        const url = URL.createObjectURL(contenu);
        const lien = document.createElement('a');
        lien.href = url;
        lien.download = piece.nomFichier;
        lien.click();
        URL.revokeObjectURL(url);
      },
      error: erreur => this.toast.show('error', 'Téléchargement impossible', apiErrorMessage(erreur))
    });
  }

  supprimer(): void {
    if (!this.pieceASupprimer) return;
    const piece = this.pieceASupprimer;
    this.service.supprimerPiece(this.vehicule.code, piece.id).subscribe({
      next: () => {
        this.pieceASupprimer = null;
        this.toast.show('success', 'Pièce jointe supprimée');
        this.service.consulter(this.vehicule.code).subscribe({
          next: detail => this.updated.emit(detail),
          error: erreur => this.toast.show('error', 'Actualisation impossible', apiErrorMessage(erreur))
        });
      },
      error: erreur => {
        this.pieceASupprimer = null;
        this.toast.show('error', 'Suppression impossible', apiErrorMessage(erreur));
      }
    });
  }
}
