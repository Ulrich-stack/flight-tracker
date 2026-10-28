import { Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Aircraft } from '../aircraft';
import { AIRPORTS, Airport } from '../airports';
import { AuthService } from '../auth.service';
import { FeedStatus, FlightDataService } from '../flight-data.service';

type SearchResult =
  | { kind: 'aircraft'; aircraft: Aircraft }
  | { kind: 'airport'; airport: Airport }
  | { kind: 'recent'; recent: RecentSearch };

interface RecentSearch {
  kind: 'aircraft' | 'airport';
  /** icao24 pour un avion, code IATA pour un aéroport. */
  id: string;
  label: string;
}

/** Texte découpé autour de la partie qui correspond à la recherche. */
interface Highlight {
  pre: string;
  match: string;
  post: string;
}

// Codes IATA (numéros commerciaux, ex. AF1510) -> codes OACI (indicatifs radio, ex. AFR1510).
const AIRLINE_ICAO: Record<string, string> = {
  AF: 'AFR', KL: 'KLM', BA: 'BAW', LH: 'DLH', U2: 'EZY', DS: 'EZS', FR: 'RYR', W6: 'WZZ',
  IB: 'IBE', VY: 'VLG', AZ: 'ITY', LX: 'SWR', SN: 'BEL', TP: 'TAP', SK: 'SAS', AY: 'FIN',
  OS: 'AUA', LO: 'LOT', EI: 'EIN', A3: 'AEE', TO: 'TVF', HV: 'TRA', EW: 'EWG', LS: 'EXS',
  EK: 'UAE', QR: 'QTR', EY: 'ETD', TK: 'THY', DL: 'DAL', AA: 'AAL', UA: 'UAL', AC: 'ACA',
  AT: 'RAM', SV: 'SVA', MS: 'MSR', ET: 'ETH', SQ: 'SIA', CX: 'CPA', NH: 'ANA', JL: 'JAL',
};
const RECENTS_KEY = 'cloudtrack.recentSearches';
const MAX_RECENTS = 5;

@Component({
  selector: 'app-topbar',
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.css',
})
export class TopbarComponent implements OnInit, OnDestroy {
  @ViewChild('searchInput') private searchInput!: ElementRef<HTMLInputElement>;

  query = '';
  results: SearchResult[] = [];
  activeIndex = 0;
  searchOpen = false;
  searchFocused = false;
  menuOpen = false;
  recents: RecentSearch[] = this.readRecents();
  /** Indicatif réellement cherché (après conversion IATA -> OACI), pour le surlignage. */
  private effectiveQuery = '';
  readonly isMac = /Mac|iPhone|iPad/.test(navigator.platform);

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

  get loading(): boolean {
    return this.status.source === 'loading';
  }

  /** Première ligne de chaque groupe : sert à afficher l'en-tête du groupe. */
  isGroupStart(i: number): boolean {
    return i === 0 || this.results[i].kind !== this.results[i - 1].kind;
  }

  groupLabel(r: SearchResult): string {
    return r.kind === 'airport' ? 'Aéroports' : r.kind === 'aircraft' ? 'Vols en cours' : 'Recherches récentes';
  }

  highlight(text: string, kind: 'aircraft' | 'airport'): Highlight {
    const q = (kind === 'aircraft' ? this.effectiveQuery : this.query.trim()).toUpperCase();
    const i = q ? text.toUpperCase().indexOf(q) : -1;
    if (i < 0) {
      return { pre: text, match: '', post: '' };
    }
    return { pre: text.slice(0, i), match: text.slice(i, i + q.length), post: text.slice(i + q.length) };
  }

  onQuery(value: string): void {
    this.query = value;
    this.results = value.trim()
      ? this.search(value)
      : this.recents.map((recent) => ({ kind: 'recent', recent }) as SearchResult);
    this.activeIndex = 0;
    this.searchOpen = true;
  }

  onFocus(): void {
    this.searchFocused = true;
    this.onQuery(this.query);
  }

  clear(): void {
    this.onQuery('');
    this.searchInput.nativeElement.focus();
  }

  clearRecents(): void {
    this.recents = [];
    this.writeRecents();
    this.onQuery(this.query);
  }

  onSearchKey(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.searchOpen = false;
      this.searchInput.nativeElement.blur();
      return;
    }
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
    }
  }

  choose(r: SearchResult): void {
    const target: RecentSearch =
      r.kind === 'aircraft'
        ? { kind: 'aircraft', id: r.aircraft.icao24, label: r.aircraft.callsign || r.aircraft.icao24.toUpperCase() }
        : r.kind === 'airport'
          ? { kind: 'airport', id: r.airport.iata, label: `${r.airport.iata} · ${r.airport.name}` }
          : r.recent;

    this.remember(target);
    this.searchOpen = false;
    this.query = '';
    this.searchInput.nativeElement.blur();
    this.router.navigate(target.kind === 'aircraft' ? ['/vol', target.id] : ['/aeroport', target.id]);
  }

  /** Ctrl+K / Cmd+K ou « / » : ouvre la recherche depuis n'importe quelle page. */
  @HostListener('document:keydown', ['$event'])
  onShortcut(event: KeyboardEvent): void {
    const target = event.target as HTMLElement;
    const typing = target.closest('input, textarea, select, [contenteditable]');
    if ((event.key === 'k' && (event.ctrlKey || event.metaKey)) || (event.key === '/' && !typing)) {
      event.preventDefault();
      this.searchInput.nativeElement.focus();
      this.searchInput.nativeElement.select();
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
    const search = this.host.nativeElement.querySelector('.search');
    if (search && !search.contains(event.target as Node)) {
      this.searchOpen = false;
    }
    if (!this.host.nativeElement.contains(event.target as Node)) {
      this.searchOpen = false;
      this.menuOpen = false;
    }
  }

  private search(raw: string): SearchResult[] {
    const q = raw.trim().toUpperCase().replace(/\s+/g, '');
    if (!q) {
      return [];
    }

    // « AF1510 » ou « AF » -> « AFR1510 » / « AFR » (indicatif radio utilisé par OpenSky).
    const iata = /^([A-Z0-9]{2})(\d{0,4}[A-Z]?)$/.exec(q);
    const icaoPrefix = iata ? AIRLINE_ICAO[iata[1]] : undefined;
    const callsignQuery = icaoPrefix ? icaoPrefix + iata![2] : q;
    this.effectiveQuery = callsignQuery;

    const airports = AIRPORTS.map((airport) => {
      const exact = airport.iata === q || airport.icao === q;
      const text = `${airport.name} ${airport.city} ${airport.country}`.toUpperCase();
      return { airport, score: exact ? 0 : airport.iata.startsWith(q) ? 1 : text.includes(q) ? 2 : -1 };
    })
      .filter((m) => m.score >= 0)
      .sort((a, b) => a.score - b.score)
      .slice(0, 4)
      .map(({ airport }) => ({ kind: 'airport', airport }) as SearchResult);

    const aircraft: SearchResult[] = [];
    if (q.length >= 2) {
      for (const a of this.data.current) {
        const cs = a.callsign.toUpperCase();
        if (cs.startsWith(callsignQuery) || (icaoPrefix && cs.startsWith(q)) || a.icao24.toUpperCase() === q) {
          aircraft.push({ kind: 'aircraft', aircraft: a });
        }
      }
      // Correspondance exacte d'abord, puis les avions en vol, puis l'ordre alphabétique.
      aircraft.sort((x, y) => {
        const a = (x as { aircraft: Aircraft }).aircraft;
        const b = (y as { aircraft: Aircraft }).aircraft;
        const exact = Number(b.callsign === callsignQuery) - Number(a.callsign === callsignQuery);
        return exact || Number(a.onGround) - Number(b.onGround) || a.callsign.localeCompare(b.callsign);
      });
    }
    return [...airports, ...aircraft.slice(0, 6)];
  }

  private remember(item: RecentSearch): void {
    this.recents = [item, ...this.recents.filter((r) => !(r.kind === item.kind && r.id === item.id))].slice(0, MAX_RECENTS);
    this.writeRecents();
  }

  private readRecents(): RecentSearch[] {
    try {
      return JSON.parse(localStorage.getItem(RECENTS_KEY) ?? '[]');
    } catch {
      return [];
    }
  }

  private writeRecents(): void {
    try {
      localStorage.setItem(RECENTS_KEY, JSON.stringify(this.recents));
    } catch {
      // stockage indisponible : les récents restent en mémoire
    }
  }

  private tick(): void {
    const now = new Date();
    this.utcTime = [now.getUTCHours(), now.getUTCMinutes()]
      .map((n) => n.toString().padStart(2, '0'))
      .join(':');
  }
}
