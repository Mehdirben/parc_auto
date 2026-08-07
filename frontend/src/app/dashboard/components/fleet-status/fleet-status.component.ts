import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FleetSegment } from '../../models/dashboard.models';

@Component({
  selector: 'app-fleet-status',
  imports: [RouterLink],
  templateUrl: './fleet-status.component.html',
  styleUrls: ['./fleet-status.component.css']
})
export class FleetStatusComponent {
  @Input() total: number | string = '—';
  @Input() segments: FleetSegment[] = [];
  @Input() loading = false;

  get hasKnownTotal(): boolean {
    return typeof this.total === 'number';
  }

  get hasVehicles(): boolean {
    return typeof this.total === 'number' && this.total > 0;
  }

  get availablePercentage(): number {
    return this.segments.find(segment => segment.tone === 'available')?.percentage ?? 0;
  }
}
