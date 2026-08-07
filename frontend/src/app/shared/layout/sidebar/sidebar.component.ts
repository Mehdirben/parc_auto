
import { Component, EventEmitter, HostBinding, Input, Output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { SidebarAccountComponent } from '../sidebar-account/sidebar-account.component';

export interface NavigationItem {
  label: string;
  route: string;
  icon: string;
  adminOnly?: boolean;
}

@Component({
    selector: 'app-sidebar',
    imports: [RouterLink, RouterLinkActive, SidebarAccountComponent],
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {
  @Input() items: NavigationItem[] = [];
  @Input() open = false;
  @Input() collapsed = false;
  @Input() authenticated = false;
  @Input() userInitials = '';
  @Input() userFullName = '';
  @Input() userRole = '';
  @Output() closed = new EventEmitter<void>();
  @Output() collapsedChange = new EventEmitter<boolean>();
  @Output() accountOpened = new EventEmitter<void>();
  @Output() loggedIn = new EventEmitter<void>();
  @Output() loggedOut = new EventEmitter<void>();

  @HostBinding('class.mobile-open') get mobileOpen(): boolean { return this.open; }
}
