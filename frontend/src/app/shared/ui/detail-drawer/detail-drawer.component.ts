import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-detail-drawer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './detail-drawer.component.html',
  styleUrls: ['./detail-drawer.component.css']
})
export class DetailDrawerComponent {
  @Input() open = false;
  @Input() loading = false;
  @Input() loadingText = 'Chargement…';
  @Input() eyebrow = '';
  @Input() title = '';
  @Input() code = '';
  @Input() ariaLabel = 'Détail';
  @Output() closed = new EventEmitter<void>();
}
