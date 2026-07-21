import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PageHeaderComponent } from '../ui/page-header/page-header.component';
import { EmptyStateComponent } from '../ui/empty-state/empty-state.component';

@Component({
  selector: 'app-feature-placeholder',
  standalone: true,
  imports: [CommonModule, RouterLink, PageHeaderComponent, EmptyStateComponent],
  templateUrl: './feature-placeholder.component.html'
})
export class FeaturePlaceholderComponent implements OnInit {
  title = '';
  description = '';

  constructor(private readonly route: ActivatedRoute) {}

  ngOnInit(): void {
    this.title = this.route.snapshot.data['title'] ?? 'Module';
    this.description = this.route.snapshot.data['description'] ?? '';
  }
}
