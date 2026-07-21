import { CommonModule } from '@angular/common';
import { Component, EventEmitter, HostBinding, Input, Output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

export interface NavigationItem {
  label: string;
  route: string;
  icon: string;
  adminOnly?: boolean;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {
  @Input() items: NavigationItem[] = [];
  @Input() open = false;
  @Input() collapsed = false;
  @Output() closed = new EventEmitter<void>();
  @Output() collapsedChange = new EventEmitter<boolean>();

  @HostBinding('class.mobile-open') get mobileOpen(): boolean { return this.open; }
}
