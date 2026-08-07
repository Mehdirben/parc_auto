
import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';

@Component({
    selector: 'app-detail-modal',
    imports: [],
    templateUrl: './detail-modal.component.html',
    styleUrls: ['./detail-modal.component.css']
})
export class DetailModalComponent {
  @Input() open = false;
  @Input() loading = false;
  @Input() loadingText = 'Chargement…';
  @Input() eyebrow = '';
  @Input() title = '';
  @Input() code = '';
  @Input() ariaLabel = 'Détail';
  @Output() closed = new EventEmitter<void>();

  @HostListener('document:keydown.escape')
  fermerAvecEchap(): void {
    if (this.open) this.closed.emit();
  }
}
