import { Component, Inject, OnInit, Optional, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import Keycloak from 'keycloak-js';
import { KEYCLOAK, KeycloakTokenParsed } from '../tokens';
import { HeroBannerComponent } from '../shared/ui/hero-banner/hero-banner.component';
import { PageHeaderComponent } from '../shared/ui/page-header/page-header.component';
import { StatCardComponent, StatCardTone } from '../shared/ui/stat-card/stat-card.component';
import { ServiceParcService } from '../referentiels/services-parcs/service-parc.service';

interface DashboardMetric {
  label: string;
  value: string | number;
  tone: StatCardTone;
  icon: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, HeroBannerComponent, PageHeaderComponent, StatCardComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  private readonly serviceParc = inject(ServiceParcService);

  isAuthenticated = false;
  fullName = '';

  readonly metrics: DashboardMetric[] = [
    { label: 'Véhicules', value: '—', tone: 'green', icon: 'M18.92 6.01 17.08 2.33A2 2 0 0 0 15.29 1H8.71a2 2 0 0 0-1.79 1.33L5.08 6.01A3 3 0 0 0 3 8.86V17a2 2 0 0 0 2 2h1v2h2v-2h8v2h2v-2h1a2 2 0 0 0 2-2V8.86a3 3 0 0 0-2.08-2.85ZM7 15a2 2 0 1 1 0-4 2 2 0 0 1 0 4Zm10 0a2 2 0 1 1 0-4 2 2 0 0 1 0 4Z' },
    { label: 'Affectations actives', value: '—', tone: 'gold', icon: 'M19 3h-4.18A3 3 0 0 0 9.18 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2Zm-7 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2Zm-2 14-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8Z' },
    { label: 'Conducteurs actifs', value: '—', tone: 'blue', icon: 'M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2ZM8 7.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM12 17H4v-.75c0-1.66 2.67-2.75 4-2.75s4 1.09 4 2.75V17Zm7-1h-5v-2h5v2Zm0-4h-5v-2h5v2Z' },
    { label: 'Services et parcs', value: '—', tone: 'slate', icon: 'M12 3 2 8v2h20V8L12 3ZM4 12v7H2v2h20v-2h-2v-7h-2v7h-4v-7h-4v7H6v-7H4Z' }
  ];

  constructor(@Optional() @Inject(KEYCLOAK) private readonly keycloak: Keycloak | null) {}

  ngOnInit(): void {
    this.isAuthenticated = !!this.keycloak?.authenticated;

    this.serviceParc.statistiques().subscribe({
      next: (stats) => {
        const metric = this.metrics.find(m => m.label === 'Services et parcs');
        if (metric) {
          metric.value = stats.total;
        }
      },
      error: () => {}
    });

    if (!this.keycloak?.tokenParsed) {
      return;
    }
    const token = this.keycloak.tokenParsed as KeycloakTokenParsed;

    const given = token.given_name ?? '';
    const family = token.family_name ?? '';
    const computedName = `${given} ${family}`.trim();
    this.fullName = (token.name ?? computedName) || 'Utilisateur';
  }
}
