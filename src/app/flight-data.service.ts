import { Injectable, NgZone, OnDestroy } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, map, of } from 'rxjs';
import { Aircraft, TrackPoint, fromOpenSkyState } from './aircraft';

export interface FeedStatus {
  /** live : OpenSky en direct ; sample : instantané local ; loading : premier chargement. */
  source: 'loading' | 'live' | 'sample';
  /** Horodatage (s) des données affichées. */
  dataTime: number | null;
  message?: string;
}

// En anonyme, OpenSky accorde ~400 crédits/jour et une requête mondiale en coûte 4.
// Une requête par minute, en pause quand l'onglet est caché, tient dans ce budget.
const POLL_MS = 60_000;
const RETRY_LIVE_MS = 5 * 60_000;
const SAMPLE_URL = 'assets/flightsOpenSky.json';
const HISTORY_LENGTH = 60;

@Injectable({ providedIn: 'root' })
export class FlightDataService implements OnDestroy {
  readonly aircraft$ = new BehaviorSubject<Aircraft[]>([]);
  readonly status$ = new BehaviorSubject<FeedStatus>({ source: 'loading', dataTime: null });

  /** Instant (ms, horloge locale) de réception des dernières données. */
  private receivedAt = Date.now();
  private dataTime = 0;
  private timer?: ReturnType<typeof setTimeout>;
  private started = false;
  private readonly history = new Map<string, TrackPoint[]>();
  private readonly onVisibility = () => {
    if (!document.hidden) {
      this.schedule(0);
    }
  };

  constructor(private http: HttpClient, private zone: NgZone) {}

  /** Démarre l'actualisation (idempotent). */
  start(): void {
    if (this.started) {
      return;
    }
    this.started = true;
    document.addEventListener('visibilitychange', this.onVisibility);
    this.schedule(0);
  }

  ngOnDestroy(): void {
    clearTimeout(this.timer);
    document.removeEventListener('visibilitychange', this.onVisibility);
  }

  get current(): Aircraft[] {
    return this.aircraft$.value;
  }

  find(icao24: string): Aircraft | undefined {
    return this.current.find((a) => a.icao24 === icao24);
  }

  /**
   * Position estimée maintenant, à partir de la dernière position connue,
   * de la vitesse et du cap (navigation à l'estime).
   */
  extrapolate(a: Aircraft, nowMs = Date.now()): [number, number] {
    if (a.onGround || !a.velocity || a.heading == null) {
      return [a.lat, a.lng];
    }
    const cap = this.status$.value.source === 'live' ? 120 : 600;
    const lag = Math.max(0, this.dataTime - (a.timePosition ?? this.dataTime));
    const dt = Math.min(cap, lag + (nowMs - this.receivedAt) / 1000);
    const dist = a.velocity * dt;
    const rad = (a.heading * Math.PI) / 180;
    const lat = a.lat + (dist * Math.cos(rad)) / 111_320;
    const lng = a.lng + (dist * Math.sin(rad)) / (111_320 * Math.cos((a.lat * Math.PI) / 180));
    return [lat, lng];
  }

  /** Trajectoire récente : API OpenSky, sinon positions mémorisées localement. */
  track(icao24: string): Observable<TrackPoint[]> {
    const local = () => this.history.get(icao24) ?? [];
    if (this.status$.value.source !== 'live') {
      return of(local());
    }
    return this.http.get<any>(`/opensky/tracks/all?icao24=${icao24}&time=0`).pipe(
      map((t) => (t?.path ?? []).map((p: any[]) => [p[0], p[1], p[2], p[3]] as TrackPoint)),
      map((path: TrackPoint[]) => (path.length ? path : local())),
      catchError(() => of(local()))
    );
  }

  private schedule(delay: number): void {
    clearTimeout(this.timer);
    this.zone.runOutsideAngular(() => {
      this.timer = setTimeout(() => this.zone.run(() => this.poll()), delay);
    });
  }

  private poll(): void {
    if (document.hidden) {
      return; // reprend au retour sur l'onglet
    }
    this.http.get<any>('/opensky/states/all').subscribe({
      next: (res) => {
        this.publish(res, 'live');
        this.schedule(POLL_MS);
      },
      error: (err: HttpErrorResponse) => {
        const message =
          err.status === 429
            ? 'Quota OpenSky atteint, données d’exemple affichées.'
            : 'OpenSky injoignable, données d’exemple affichées.';
        this.loadSample(message);
        this.schedule(RETRY_LIVE_MS);
      },
    });
  }

  private loadSample(message: string): void {
    if (this.status$.value.source === 'sample') {
      this.status$.next({ ...this.status$.value, message });
      return;
    }
    this.http.get<any>(SAMPLE_URL).subscribe((res) => this.publish(res, 'sample', message));
  }

  private publish(res: any, source: 'live' | 'sample', message?: string): void {
    const list = (res?.states ?? [])
      .map(fromOpenSkyState)
      .filter((a: Aircraft | null): a is Aircraft => a !== null);

    this.receivedAt = Date.now();
    this.dataTime = res?.time ?? Math.floor(this.receivedAt / 1000);
    if (source === 'live') {
      this.remember(list);
    }
    this.aircraft$.next(list);
    this.status$.next({ source, dataTime: this.dataTime, message });
  }

  private remember(list: Aircraft[]): void {
    const seen = new Set<string>();
    for (const a of list) {
      seen.add(a.icao24);
      const points = this.history.get(a.icao24) ?? [];
      const t = a.timePosition ?? this.dataTime;
      if (!points.length || points[points.length - 1][0] !== t) {
        points.push([t, a.lat, a.lng, a.altitude]);
        if (points.length > HISTORY_LENGTH) {
          points.shift();
        }
      }
      this.history.set(a.icao24, points);
    }
    for (const id of this.history.keys()) {
      if (!seen.has(id)) {
        this.history.delete(id);
      }
    }
  }
}
