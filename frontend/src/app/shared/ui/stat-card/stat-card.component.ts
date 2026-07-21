import { Component, Input } from '@angular/core';

export type StatCardTone = 'green' | 'gold' | 'blue' | 'slate';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  templateUrl: './stat-card.component.html',
  styleUrls: ['./stat-card.component.css']
})
export class StatCardComponent {
  @Input() label = '';
  @Input() value: string | number = '—';
  @Input() icon = '';
  @Input() tone: StatCardTone = 'green';
}
