import { Component, EventEmitter, Input, Output } from '@angular/core';


@Component({
    selector: 'app-confirm-dialog',
    imports: [],
    templateUrl: './confirm-dialog.component.html',
    styleUrls: ['./confirm-dialog.component.css']
})
export class ConfirmDialogComponent {
  @Input() open = false;
  @Input() title = 'Confirmer l’action';
  @Input() message = 'Souhaitez-vous continuer ?';
  @Input() confirmLabel = 'Confirmer';
  @Input() destructive = false;
  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();
}
