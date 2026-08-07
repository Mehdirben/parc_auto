import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ToastService } from '../../../core/toast.service';
import { PermissionService } from '../../../core/permission.service';
import { PageResponse } from '../../../shared/models/api.models';
import { DataTableComponent } from '../../../shared/ui/data-table/data-table.component';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header.component';
import { PaginationComponent } from '../../../shared/ui/pagination/pagination.component';
import { SearchToolbarComponent } from '../../../shared/ui/search-toolbar/search-toolbar.component';
import { TableLoadingComponent } from '../../../shared/ui/table-loading/table-loading.component';
import { apiErrorMessage } from '../../../shared/utils/api-error';
import { emptyPage } from '../../../shared/utils/empty-page';
import { lierFiltresListe } from '../../../shared/utils/list-filters';
import {
  Carburant, GenreVehicule, StatutVehicule
} from '../../../vehicules/models/vehicule.models';
import {
  libelleCarburantVehicule, libelleEtatVehicule, libelleGenreVehicule
} from '../../../vehicules/utils/vehicule-labels';
import { ImportSituationModalComponent } from '../../components/import-situation-modal/import-situation-modal.component';
import { SituationVehiculeService } from '../../data-access/situation-vehicule.service';
import {
  FiltresSituation, SituationVehicule
} from '../../models/situation-vehicule.models';

@Component({
    selector: 'app-situation-vehicules',
    imports: [
        CommonModule, ReactiveFormsModule, DataTableComponent, EmptyStateComponent,
        PageHeaderComponent, PaginationComponent, SearchToolbarComponent,
        TableLoadingComponent, ImportSituationModalComponent
    ],
    templateUrl: './situation-vehicules.component.html',
    styleUrls: [
        '../../../shared/styles/entity-list.css',
        './situation-vehicules.component.css'
    ]
})
export class SituationVehiculesComponent implements OnInit {
  readonly permissions = inject(PermissionService);
  private readonly service = inject(SituationVehiculeService);
  private readonly toast = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);

  readonly recherche = new FormControl('', { nonNullable: true });
  readonly statutFiltre = new FormControl<StatutVehicule | ''>('', { nonNullable: true });
  readonly genreFiltre = new FormControl<GenreVehicule | ''>('', { nonNullable: true });
  readonly carburantFiltre = new FormControl<Carburant | ''>('', { nonNullable: true });
  readonly libelleGenre = libelleGenreVehicule;
  readonly libelleCarburant = libelleCarburantVehicule;
  readonly libelleEtat = libelleEtatVehicule;

  page: PageResponse<SituationVehicule> = emptyPage();
  chargement = true;
  exportEnCours = false;
  erreur = '';
  importOuvert = false;

  ngOnInit(): void {
    this.charger();
    lierFiltresListe(this.destroyRef, [
      { control: this.recherche, debounce: 300 },
      { control: this.statutFiltre },
      { control: this.genreFiltre },
      { control: this.carburantFiltre }
    ], () => this.charger(0));
  }

  charger(numeroPage = this.page.page): void {
    this.chargement = true;
    this.erreur = '';
    this.service.rechercher(this.filtres, numeroPage).subscribe({
      next: page => {
        this.page = page;
        this.chargement = false;
      },
      error: erreur => {
        this.erreur = apiErrorMessage(erreur);
        this.chargement = false;
      }
    });
  }

  exporter(): void {
    if (this.exportEnCours) return;
    this.exportEnCours = true;
    this.service.exporter(this.filtres).subscribe({
      next: contenu => {
        const url = URL.createObjectURL(contenu);
        const lien = document.createElement('a');
        lien.href = url;
        lien.download = 'SIT.xlsx';
        lien.click();
        URL.revokeObjectURL(url);
        this.exportEnCours = false;
        this.toast.show('success', 'Export terminé', 'Le fichier SIT.xlsx a été téléchargé.');
      },
      error: erreur => {
        this.exportEnCours = false;
        this.toast.show('error', 'Export impossible', apiErrorMessage(erreur));
      }
    });
  }

  apresImport(): void {
    this.charger(0);
  }

  identifier(_index: number, vehicule: SituationVehicule): string {
    return vehicule.code;
  }

  private get filtres(): FiltresSituation {
    return {
      search: this.recherche.value.trim(),
      statut: this.statutFiltre.value,
      genre: this.genreFiltre.value,
      carburant: this.carburantFiltre.value
    };
  }
}
