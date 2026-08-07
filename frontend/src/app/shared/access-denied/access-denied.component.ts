import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PageHeaderComponent } from '../ui/page-header/page-header.component';
import { EmptyStateComponent } from '../ui/empty-state/empty-state.component';

@Component({
    selector: 'app-access-denied',
    imports: [RouterLink, PageHeaderComponent, EmptyStateComponent],
    template: `
    <app-page-header eyebrow="Sécurité" title="Accès refusé" description="Votre compte ne possède pas les habilitations nécessaires."></app-page-header>
    <app-empty-state title="Module non autorisé" description="Contactez un administrateur si vous pensez devoir accéder à cette fonctionnalité.">
      <a class="btn btn-secondary" routerLink="/dashboard">Retour au tableau de bord</a>
    </app-empty-state>
  `
})
export class AccessDeniedComponent {}
