import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-audit-trail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './audit-trail.component.html',
  styleUrls: ['./audit-trail.component.css']
})
export class AuditTrailComponent {
  @Input() createdAt: string | Date | null = null;
  @Input() createdBy = '';
  @Input() updatedAt: string | Date | null = null;
  @Input() updatedBy = '';
}
