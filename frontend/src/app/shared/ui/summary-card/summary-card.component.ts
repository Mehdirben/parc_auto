import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-summary-card',
  standalone: true,
  templateUrl: './summary-card.component.html',
  styleUrls: ['./summary-card.component.css']
})
export class SummaryCardComponent {
  @Input() value: string | number = '';
  @Input() label = '';
  @Input() icon = '';
  @Input() tone: 'green' | 'gold' = 'green';
}
