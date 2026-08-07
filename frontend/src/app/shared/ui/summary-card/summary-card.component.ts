import { Component, Input } from '@angular/core';

export type SummaryCardTone = 'green' | 'gold' | 'blue' | 'slate';

@Component({
  selector: 'app-summary-card',
  templateUrl: './summary-card.component.html',
  styleUrls: ['./summary-card.component.css']
})
export class SummaryCardComponent {
  @Input() value: string | number = '';
  @Input() label = '';
  @Input() icon = '';
  @Input() tone: SummaryCardTone = 'green';
}
