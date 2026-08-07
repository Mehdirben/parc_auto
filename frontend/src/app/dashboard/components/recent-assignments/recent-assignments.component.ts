import { DatePipe } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { RecentAffectation } from '../../models/dashboard.models';

@Component({
  selector: 'app-recent-assignments',
  imports: [DatePipe, RouterLink],
  templateUrl: './recent-assignments.component.html',
  styleUrls: ['./recent-assignments.component.css']
})
export class RecentAssignmentsComponent {
  @Input() assignments: RecentAffectation[] = [];
  @Input() loading = false;
}
