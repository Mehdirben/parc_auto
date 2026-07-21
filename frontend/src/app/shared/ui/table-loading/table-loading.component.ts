import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-table-loading',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './table-loading.component.html',
  styleUrls: ['./table-loading.component.css']
})
export class TableLoadingComponent {
  @Input() rows = 5;
  @Input() columns = '90px 1fr 120px 160px';

  get rowItems(): number[] { return Array.from({ length: this.rows }, (_, index) => index); }
  readonly cellItems = [0, 1, 2, 3];
}
