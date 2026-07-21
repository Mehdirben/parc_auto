import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.css']
})
export class TopbarComponent {
  @Input() authenticated = false;
  @Input() initials = '';
  @Input() fullName = '';
  @Input() role = '';
  @Output() menuOpened = new EventEmitter<void>();
  @Output() accountOpened = new EventEmitter<void>();
  @Output() loggedIn = new EventEmitter<void>();
  @Output() loggedOut = new EventEmitter<void>();
}
