import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-information-notice',
  templateUrl: './information-notice.component.html',
  styleUrls: ['./information-notice.component.css']
})
export class InformationNoticeComponent {
  @Input() title = 'Information';
  @Input() message = '';
}
