import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject } from '@angular/core';
import { ToastService } from '../../../core/toast.service';
import { FormModalComponent } from '../../../shared/ui/form-modal/form-modal.component';
import { apiErrorMessage } from '../../../shared/utils/api-error';
import { SituationVehiculeService } from '../../data-access/situation-vehicule.service';
import {
  ActionImport, ApercuImport, ResultatImport
} from '../../models/situation-vehicule.models';

@Component({
    selector: 'app-import-situation-modal',
    imports: [CommonModule, FormModalComponent],
    templateUrl: './import-situation-modal.component.html',
    styleUrls: ['./import-situation-modal.component.css']
})
export class ImportSituationModalComponent implements OnChanges {
  @Input() open = false;
  @Output() closed = new EventEmitter<void>();
  @Output() imported = new EventEmitter<void>();

  private readonly service = inject(SituationVehiculeService);
  private readonly toast = inject(ToastService);

  fichier: File | null = null;
  apercu: ApercuImport | null = null;
  resultat: ResultatImport | null = null;
  chargement = false;
  telechargementModele = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['open']?.currentValue) this.réinitialiser();
  }

  selectionner(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.fichier = input.files?.[0] ?? null;
    this.apercu = null;
    this.resultat = null;
    if (!this.fichier) return;
    this.chargement = true;
    this.service.prévisualiser(this.fichier).subscribe({
      next: apercu => {
        this.apercu = apercu;
        this.chargement = false;
      },
      error: erreur => {
        this.chargement = false;
        this.toast.show('error', 'Aperçu impossible', apiErrorMessage(erreur));
      }
    });
  }

  confirmer(): void {
    if (!this.fichier || !this.apercu || this.chargement) return;
    this.chargement = true;
    this.service.importer(this.fichier).subscribe({
      next: resultat => {
        this.resultat = resultat;
        this.chargement = false;
        this.imported.emit();
        this.toast.show('success', 'Import terminé',
          `${resultat.nombreCreations} création(s), ${resultat.nombreMisesAJour} mise(s) à jour.`);
      },
      error: erreur => {
        this.chargement = false;
        this.toast.show('error', 'Import impossible', apiErrorMessage(erreur));
      }
    });
  }

  telechargerModele(): void {
    if (this.telechargementModele) return;
    this.telechargementModele = true;
    this.service.téléchargerModèleImport().subscribe({
      next: contenu => {
        const url = URL.createObjectURL(contenu);
        const lien = document.createElement('a');
        lien.href = url;
        lien.download = 'SIT.xlsx';
        lien.click();
        URL.revokeObjectURL(url);
        this.telechargementModele = false;
        this.toast.show('success', 'Modèle téléchargé',
          'Le fichier SIT.xlsx vide est prêt à être complété.');
      },
      error: erreur => {
        this.telechargementModele = false;
        this.toast.show('error', 'Téléchargement impossible', apiErrorMessage(erreur));
      }
    });
  }

  fermer(): void {
    this.closed.emit();
  }

  libelleAction(action: ActionImport): string {
    return action === 'CREATION' ? 'Création'
      : action === 'MISE_A_JOUR' ? 'Mise à jour' : 'Ignorée';
  }

  private réinitialiser(): void {
    this.fichier = null;
    this.apercu = null;
    this.resultat = null;
    this.chargement = false;
    this.telechargementModele = false;
  }
}
