import { Component, EventEmitter, Input, Output } from '@angular/core';


@Component({
    selector: 'app-session-timeout-modal',
    imports: [],
    templateUrl: './session-timeout-modal.component.html',
    styleUrls: ['./session-timeout-modal.component.css']
})
export class SessionTimeoutModalComponent {
  @Input() visible = false;
  @Input() countdown = 60;
  @Output() extended = new EventEmitter<void>();
  @Output() loggedOut = new EventEmitter<void>();

  get formattedCountdown(): string {
    const min = Math.floor(this.countdown / 60);
    const sec = this.countdown % 60;
    return min > 0 ? `${min}:${sec.toString().padStart(2, '0')}` : `${sec}s`;
  }

  get progressPercent(): number {
    return (this.countdown / 60) * 100;
  }
}
