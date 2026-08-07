
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
    selector: 'app-pagination',
    imports: [],
    templateUrl: './pagination.component.html',
    styleUrls: ['./pagination.component.css']
})
export class PaginationComponent {
  @Input() page = 0;
  @Input() pageSize = 10;
  @Input() totalItems = 0;
  @Input() totalPages = 0;
  @Input() first = true;
  @Input() last = true;
  @Input() disabled = false;
  @Output() pageChange = new EventEmitter<number>();

  get start(): number { return this.totalItems === 0 ? 0 : this.page * this.pageSize + 1; }
  get end(): number { return Math.min((this.page + 1) * this.pageSize, this.totalItems); }
}
