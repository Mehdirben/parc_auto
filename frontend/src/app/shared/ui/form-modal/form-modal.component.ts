
import { Component, EventEmitter, Input, Output, ViewEncapsulation } from '@angular/core';

@Component({
    selector: 'app-form-modal',
    imports: [],
    templateUrl: './form-modal.component.html',
    styleUrls: ['./form-modal.component.css'],
    encapsulation: ViewEncapsulation.None
})
export class FormModalComponent {
  @Input() open = false;
  @Input() eyebrow = '';
  @Input() title = '';
  @Input() size: 'default' | 'small' | 'large' = 'default';
  @Output() closed = new EventEmitter<void>();
}
