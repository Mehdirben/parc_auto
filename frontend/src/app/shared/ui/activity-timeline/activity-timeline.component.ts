import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

export interface ActivityItem {
  label: string;
  date: string;
  user: string;
  tone?: 'green' | 'gold' | 'red';
}

@Component({
    selector: 'app-activity-timeline',
    imports: [CommonModule],
    templateUrl: './activity-timeline.component.html',
    styleUrls: ['./activity-timeline.component.css']
})
export class ActivityTimelineComponent {
  @Input() title = 'Historique des actions';
  @Input() items: ActivityItem[] = [];
}
