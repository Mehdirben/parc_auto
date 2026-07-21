import { Injectable, Inject, Optional, NgZone, OnDestroy } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import Keycloak from 'keycloak-js';
import { KEYCLOAK } from '../tokens';

/** How many minutes of inactivity before showing the warning modal. */
const IDLE_TIMEOUT_MINUTES = 30;

/** How many seconds the warning countdown lasts before auto-logout. */
const WARNING_COUNTDOWN_SECONDS = 60;

/**
 * Tracks user activity (mouse, keyboard, scroll, touch) and manages
 * an inactivity timeout with a warning countdown before auto-logout.
 *
 * The service runs entirely outside Angular's change detection zone
 * to avoid triggering unnecessary CD cycles on every mouse-move.
 */
@Injectable({ providedIn: 'root' })
export class InactivityService implements OnDestroy {
  /** Whether the warning modal should be visible. */
  readonly showWarning$ = new BehaviorSubject<boolean>(false);

  /** Remaining seconds on the countdown (only meaningful when showWarning$ is true). */
  readonly countdown$ = new BehaviorSubject<number>(WARNING_COUNTDOWN_SECONDS);

  private readonly destroy$ = new Subject<void>();
  private idleTimer: ReturnType<typeof setTimeout> | null = null;
  private countdownTimer: ReturnType<typeof setInterval> | null = null;

  private readonly IDLE_MS = IDLE_TIMEOUT_MINUTES * 60 * 1000;
  private readonly activityEvents: (keyof DocumentEventMap)[] = [
    'mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'click'
  ];

  constructor(
    @Optional() @Inject(KEYCLOAK) private readonly keycloak: Keycloak | null,
    private readonly zone: NgZone
  ) {}

  /**
   * Call once from AppComponent.ngOnInit() when the user is authenticated.
   * Starts tracking activity and resets the idle timer.
   */
  start(): void {
    if (!this.keycloak?.authenticated) {
      return;
    }

    // Listen for user activity outside Angular zone (perf)
    this.zone.runOutsideAngular(() => {
      for (const event of this.activityEvents) {
        document.addEventListener(event, this.onActivity, { passive: true });
      }
    });

    this.resetIdleTimer();
  }

  /** Resets the idle timer and hides the warning if currently shown. */
  extendSession(): void {
    this.hideWarning();
    this.resetIdleTimer();

    // Also proactively refresh the token when the user clicks "Stay connected"
    this.keycloak?.updateToken(70).catch(() => {});
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.clearTimers();

    for (const event of this.activityEvents) {
      document.removeEventListener(event, this.onActivity);
    }
  }

  private lastTokenRefreshTime = 0;

  // ─── Private ───────────────────────────────────────────────────────

  private readonly onActivity = (): void => {
    // If the warning is already showing, ignore activity — user must
    // explicitly click the "Stay connected" button.
    if (this.showWarning$.value) {
      return;
    }
    this.resetIdleTimer();

    // Refresh token during active use (throttled to at most once every 2 minutes)
    const now = Date.now();
    if (now - this.lastTokenRefreshTime > 120000) {
      this.lastTokenRefreshTime = now;
      this.keycloak?.updateToken(70).catch(() => {
        console.warn('Session expired during active use — redirecting to login.');
        void this.keycloak?.login({ redirectUri: window.location.origin });
      });
    }
  };

  private resetIdleTimer(): void {
    if (this.idleTimer) {
      clearTimeout(this.idleTimer);
    }
    this.idleTimer = setTimeout(() => this.startWarningCountdown(), this.IDLE_MS);
  }

  private startWarningCountdown(): void {
    let remaining = WARNING_COUNTDOWN_SECONDS;

    this.zone.run(() => {
      this.countdown$.next(remaining);
      this.showWarning$.next(true);
    });

    this.countdownTimer = setInterval(() => {
      remaining--;
      this.zone.run(() => this.countdown$.next(remaining));

      if (remaining <= 0) {
        this.clearTimers();
        this.zone.run(() => {
          this.showWarning$.next(false);
          this.keycloak?.logout({ redirectUri: window.location.origin });
        });
      }
    }, 1000);
  }

  private hideWarning(): void {
    this.clearCountdown();
    this.showWarning$.next(false);
  }

  private clearTimers(): void {
    if (this.idleTimer) {
      clearTimeout(this.idleTimer);
      this.idleTimer = null;
    }
    this.clearCountdown();
  }

  private clearCountdown(): void {
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
      this.countdownTimer = null;
    }
  }
}
