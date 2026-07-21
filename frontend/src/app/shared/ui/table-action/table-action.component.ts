import { Component, EventEmitter, Input, Output } from '@angular/core';

export type TableActionKind = 'view' | 'edit' | 'delete' | 'status';

@Component({
  selector: 'app-table-action',
  standalone: true,
  templateUrl: './table-action.component.html',
  styleUrls: ['./table-action.component.css']
})
export class TableActionComponent {
  @Input() kind: TableActionKind = 'view';
  @Input() label = '';
  @Output() triggered = new EventEmitter<void>();

  readonly paths: Record<TableActionKind, string> = {
    view: 'M12 5c-5 0-9.27 3.11-11 7 1.73 3.89 6 7 11 7s9.27-3.11 11-7c-1.73-3.89-6-7-11-7Zm0 12a5 5 0 1 1 0-10 5 5 0 0 1 0 10Zm0-8a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z',
    edit: 'm3 17.25-.01 3.76 3.76-.01L17.81 9.94l-3.75-3.75L3 17.25ZM20.71 7.04a1 1 0 0 0 0-1.42l-2.34-2.34a1 1 0 0 0-1.42 0l-1.83 1.83 3.75 3.75 1.84-1.82Z',
    delete: 'M6 19a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7H6v12Zm3.5-8h1v6h-1v-6Zm4 0h1v6h-1v-6ZM15.5 4l-1-1h-5l-1 1H5v2h14V4h-3.5Z',
    status: 'M13 3h-2v10h2V3Zm4.83 2.17-1.42 1.42A7 7 0 1 1 7.58 6.6L6.17 5.17a9 9 0 1 0 11.66 0Z'
  };

  get accessibleLabel(): string {
    return this.label || ({ view: 'Consulter', edit: 'Modifier', delete: 'Supprimer', status: 'Changer le statut' } as const)[this.kind];
  }
}
