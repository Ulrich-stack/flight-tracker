import { Component, ElementRef, HostListener, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Aircraft } from '../aircraft';
import { AIRPORTS, Airport } from '../airports';
import { AuthService } from '../auth.service';
import { FeedStatus, FlightDataService } from '../flight-data.service';

type SearchResult =
  | { kind: 'aircraft'; aircraft: Aircraft }
  | { kind: 'airport'; airport: Airport };

@Component({
  selector: 'app-topbar',
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.css',
})
export class TopbarComponent implements OnInit, OnDestroy {
  query = '';
  results: SearchResult[] = [];
  activeIndex = 0;
  searchOpen = false;
  menuOpen = false;

  status: FeedStatus = { source: 'loading', dataTime: null };
  count = 0;
  utcTime = '';
  private clock?: ReturnType<typeof setInterval>;
  private subs = new Subscription();

  constructor(
    private data: FlightDataService,
    private auth: AuthService,
    private router: Router,
    private host: ElementRef<HTMLElement>
  ) {}

  ngOnInit(): void {
    this.data.start();
    this.subs.add(this.data.status$.subscribe((s) => (this.status = s)));
    this.subs.add(this.data.aircraft$.subscribe((list) => (this.count = list.length)));
    this.tick();
    this.clock = setInterval(() => this.tick(), 1000);
  }

  ngOnDestroy(): void {
    clearInterval(this.clock);
    this.subs.unsubscribe();
  }

  get statusLabel(): string {
    switch (this.status.source) {
      case 'live':
        return 'En direct';
      case 'sample':
        return 'Données d’exemple';
      default:
        return 'Connexion…';
    }
  }

  get statusTitle(): string {
    const at = this.status.dataTime
      ? new Date(this.status.dataTime * 1000).toLocaleString('fr-FR')
      : '';
    return [this.status.message, at && `Données du ${at}`].filter(Boolean).join(' — ');
  }

  onQuery(value: string): void {
    this.query = value;
    this.results = this.search(value);
    this.activeIndex = 0;
    this.searchOpen = value.trim().length > 0;
  }

  onSearchKey(event: KeyboardEvent): void {
    if (!this.searchOpen || !this.results.length) {
      return;
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.activeIndex = (this.activeIndex + 1) % this.results.length;
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.activeIndex = (this.activeIndex - 1 + this.results.length) % this.results.length;
    } else if (event.key === 'Enter') {
      event.preventDefault();
      this.choose(this.results[this.activeIndex]);
    } else if (event.key === 'Escape') {
      this.searchOpen = false;
    }
  }

  choose(r: SearchResult): void {
    this.searchOpen = false;
    this.query = '';
    if (r.kind === 'aircraft') {
      this.router.navigate(['/vol', r.aircraft.icao24]);
    } else {
      this.router.navigate(['/aeroport', r.airport.iata]);
    }
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  logout(): void {
    this.menuOpen = false;
    this.auth.logOut();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.host.nativeElement.contains(event.target as Node)) {
      this.searchOpen = false;
      this.menuOpen = false;
    }
  }

  private search(raw: string): SearchResult[] {
    const q = raw.trim().toUpperCase();
    if (q.length < 2) {
      return [];
    }
    const airports = AIRPORTS.filter(
      (a) =>
        a.iata === q ||
        a.icao === q ||
        a.name.toUpperCase().includes(q) ||
        a.city.toUpperCase().includes(q)
    )
      .slice(0, 4)
      .map((airport) => ({ kind: 'airport', airport }) as SearchResult);

    const aircraft: SearchResult[] = [];
    for (const a of this.data.current) {
      if (a.callsign.toUpperCase().startsWith(q) || a.icao24.toUpperCase() === q) {
        aircraft.push({ kind: 'aircraft', aircraft: a });
        if (aircraft.length === 6) {
          break;
        }
      }
    }
    return [...airports, ...aircraft];
  }

  private tick(): void {
    const now = new Date();
    this.utcTime = [now.getUTCHours(), now.getUTCMinutes()]
      .map((n) => n.toString().padStart(2, '0'))
      .join(':');
  }
}
