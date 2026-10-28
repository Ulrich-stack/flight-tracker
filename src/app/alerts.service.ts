import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Aircraft } from './aircraft';
import { FlightDataService } from './flight-data.service';
import { PreferencesService } from './preferences.service';

export interface Toast {
  id: number;
  title: string;
  body: string;
  icao24?: string;
}

/**
 * Surveille les avions suivis et prévient au décollage, à l'atterrissage
 * et à la perte du signal.
 */
@Injectable({ providedIn: 'root' })
export class AlertsService {
  readonly toasts$ = new BehaviorSubject<Toast[]>([]);
  private lastState = new Map<string, boolean>(); // icao24 -> au sol
  private missing = new Map<string, number>();
  private nextId = 1;

  constructor(private data: FlightDataService, private prefs: PreferencesService) {
    this.data.aircraft$.subscribe((list) => this.check(list));
  }

  push(title: string, body: string, icao24?: string): void {
    const toast = { id: this.nextId++, title, body, icao24 };
    this.toasts$.next([...this.toasts$.value, toast].slice(-4));
    setTimeout(() => this.dismiss(toast.id), 8000);

    if (this.prefs.value.notifications && 'Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body, icon: 'assets/CLOUDtrack.png', tag: icao24 });
    }
  }

  dismiss(id: number): void {
    this.toasts$.next(this.toasts$.value.filter((t) => t.id !== id));
  }

  private check(list: Aircraft[]): void {
    // Les alertes n'ont de sens qu'avec des données qui évoluent.
    if (this.data.status$.value.source !== 'live' || !list.length) {
      return;
    }
    const byId = new Map(list.map((a) => [a.icao24, a]));
    for (const f of this.prefs.value.followed) {
      const a = byId.get(f.icao24);
      const name = a?.callsign || f.callsign || f.icao24.toUpperCase();
      if (!a) {
        const n = (this.missing.get(f.icao24) ?? 0) + 1;
        this.missing.set(f.icao24, n);
        if (n === 2 && this.lastState.has(f.icao24)) {
          this.push(`${name} : signal perdu`, 'L’avion n’est plus visible dans les données OpenSky.', f.icao24);
        }
        continue;
      }
      this.missing.delete(f.icao24);
      const before = this.lastState.get(f.icao24);
      if (before === true && !a.onGround) {
        this.push(`${name} a décollé`, `Départ depuis ${a.country || 'une position inconnue'}.`, f.icao24);
      } else if (before === false && a.onGround) {
        this.push(`${name} a atterri`, 'L’avion est maintenant au sol.', f.icao24);
      }
      this.lastState.set(f.icao24, a.onGround);
    }
  }
}
