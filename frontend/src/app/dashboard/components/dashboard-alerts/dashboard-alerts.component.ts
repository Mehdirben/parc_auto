import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DashboardAlert } from '../../models/dashboard.models';

@Component({
  selector: 'app-dashboard-alerts',
  imports: [RouterLink],
  templateUrl: './dashboard-alerts.component.html',
  styleUrls: ['./dashboard-alerts.component.css']
})
export class DashboardAlertsComponent {
  @Input() alerts: DashboardAlert[] = [];
  @Input() loading = false;
}
