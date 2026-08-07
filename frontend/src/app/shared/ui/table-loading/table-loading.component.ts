
import { Component, Input, OnDestroy, OnInit } from '@angular/core';

@Component({
    selector: 'app-table-loading',
    imports: [],
    templateUrl: './table-loading.component.html',
    styleUrls: ['./table-loading.component.css']
})
export class TableLoadingComponent implements OnInit, OnDestroy {
  @Input() rows = 5;
  @Input() columns = '90px 1fr 120px 160px';
  @Input() delay = 180;

  visible = false;
  private timer?: ReturnType<typeof setTimeout>;

  ngOnInit(): void {
    this.timer = setTimeout(() => this.visible = true, this.delay);
  }

  ngOnDestroy(): void {
    if (this.timer) clearTimeout(this.timer);
  }

  get rowItems(): number[] { return Array.from({ length: this.rows }, (_, index) => index); }
  readonly cellItems = [0, 1, 2, 3];
}
