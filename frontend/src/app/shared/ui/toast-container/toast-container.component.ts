import { Component, inject } from '@angular/core';
import { AsyncPipe, NgClass } from '@angular/common';
import { ToastService } from '../../../core/toast.service';

@Component({
    selector: 'app-toast-container',
    imports: [AsyncPipe, NgClass],
    templateUrl: './toast-container.component.html',
    styleUrls: ['./toast-container.component.css']
})
export class ToastContainerComponent {
  readonly toastService = inject(ToastService);
}
