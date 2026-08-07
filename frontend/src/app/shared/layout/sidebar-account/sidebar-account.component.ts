import { TitleCasePipe } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-sidebar-account',
  imports: [TitleCasePipe],
  templateUrl: './sidebar-account.component.html',
  styleUrls: ['./sidebar-account.component.css']
})
export class SidebarAccountComponent {
  @Input() authenticated = false;
  @Input() initials = '';
  @Input() fullName = '';
  @Input() role = '';
  @Input() collapsed = false;
  @Output() accountOpened = new EventEmitter<void>();
  @Output() loggedIn = new EventEmitter<void>();
  @Output() loggedOut = new EventEmitter<void>();
}
