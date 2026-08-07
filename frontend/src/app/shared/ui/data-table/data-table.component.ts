import { Component } from '@angular/core';

@Component({
  selector: 'app-data-table',
  template: '<div class="table-shell"><ng-content></ng-content></div>',
  styles: [':host { display: block; }']
})
export class DataTableComponent {}
