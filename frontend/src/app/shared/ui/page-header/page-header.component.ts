import { Component, Input } from '@angular/core';


@Component({
    selector: 'app-page-header',
    imports: [],
    templateUrl: './page-header.component.html',
    styleUrls: ['./page-header.component.css']
})
export class PageHeaderComponent {
  @Input({ required: true }) title = '';
  @Input() eyebrow = '';
  @Input() description = '';
}
