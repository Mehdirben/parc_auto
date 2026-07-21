import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type ToastKind = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: number;
  kind: ToastKind;
  title: string;
  message?: string;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private sequence = 0;
  private readonly subject = new BehaviorSubject<ToastMessage[]>([]);
  readonly messages$ = this.subject.asObservable();

  show(kind: ToastKind, title: string, message?: string): void {
    const toast = { id: ++this.sequence, kind, title, message };
    this.subject.next([...this.subject.value, toast]);
    window.setTimeout(() => this.dismiss(toast.id), 4500);
  }

  dismiss(id: number): void {
    this.subject.next(this.subject.value.filter(toast => toast.id !== id));
  }
}
