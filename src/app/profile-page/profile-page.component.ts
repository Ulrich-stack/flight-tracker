import { Component, OnDestroy, inject } from '@angular/core';
import { Auth, User, onAuthStateChanged } from '@angular/fire/auth';
import { Subscription, combineLatest } from 'rxjs';
import { Aircraft } from '../aircraft';
import { AIRPORTS } from '../airports';
import { ArrivalsService } from '../arrivals.service';
import { AuthService } from '../auth.service';
import { FlightDataService } from '../flight-data.service';
import { Preferences, PreferencesService } from '../preferences.service';

@Component({
  selector: 'app-profile-page',
  templateUrl: './profile-page.component.html',
  styles: [
    '.identity { display: flex; align-items: center; gap: 16px; }',
    '.identity .avatar { display: grid; place-items: center; width: 52px; height: 52px; border-radius: 50%; background: var(--surface-2); border: 1px solid var(--border-strong); font-size: 20px; font-weight: 600; }',
    '.settings { display: flex; flex-direction: column; gap: 16px; max-width: 420px; }',
    '.switch { display: flex; align-items: center; gap: 10px; font-size: 14px; cursor: pointer; }',
    '.switch input { width: 16px; height: 16px; accent-color: var(--accent); }',
    '.remove { border: none; background: none; color: var(--text-muted); font-size: 13px; cursor: pointer; }',
    '.remove:hover { color: var(--danger); }',
  ],
})
export class ProfilePageComponent implements OnDestroy {
  private auth = inject(Auth);
  user: User | null = null;
  username: string | null = null;
  prefs!: Preferences;
  live = new Map<string, Aircraft>();
  favoriteFlights: { code: string; flight?: any }[] = [];

  readonly arrivalAirports = AIRPORTS.filter((a) => a.arrivalsFile);
  readonly notificationsSupported = 'Notification' in window;
  private subs = new Subscription();
  private unsubscribeAuth: () => void;

  constructor(
    private authService: AuthService,
    readonly preferences: PreferencesService,
    private data: FlightDataService,
    arrivals: ArrivalsService
  ) {
    this.unsubscribeAuth = onAuthStateChanged(this.auth, (u) => (this.user = u));
    this.subs.add(this.authService.userData$.subscribe((d) => (this.username = d?.username ?? null)));
    this.data.start();
    this.subs.add(
      this.data.aircraft$.subscribe((list) => {
        const followed = new Set(this.preferences.value.followed.map((f) => f.icao24));
        this.live = new Map(list.filter((a) => followed.has(a.icao24)).map((a) => [a.icao24, a]));
      })
    );

    // Détails des vols favoris, cherchés dans les arrivées disponibles.
    const all$ = combineLatest(this.arrivalAirports.map((a) => arrivals.arrivals(a.iata)));
    this.subs.add(
      combineLatest([this.preferences.prefs$, all$]).subscribe(([prefs, lists]) => {
        this.prefs = prefs;
        const flights = lists.flat();
        this.favoriteFlights = prefs.favoriteFlights.map((code) => ({
          code,
          flight: flights.find((f) => f.flight?.iata === code),
        }));
      })
    );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
    this.unsubscribeAuth();
  }

  get initial(): string {
    return (this.username || this.user?.displayName || this.user?.email || '?').charAt(0).toUpperCase();
  }

  get notificationsBlocked(): boolean {
    return this.notificationsSupported && Notification.permission === 'denied';
  }

  async toggleNotifications(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    input.checked = await this.preferences.setNotifications(input.checked);
  }

  logout(): void {
    this.authService.logOut();
  }
}
