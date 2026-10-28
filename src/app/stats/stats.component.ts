import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Aircraft, distanceKm } from '../aircraft';
import { AIRPORTS } from '../airports';
import { BarItem } from '../bar-chart/bar-chart.component';
import { FeedStatus, FlightDataService } from '../flight-data.service';

const NEARBY_KM = 50;
// Au-delà, il s'agit d'erreurs de transpondeur (valeurs physiquement improbables).
const MAX_ALTITUDE_M = 16_000;
const MAX_SPEED_MS = 360; // ~1 300 km/h

@Component({
  selector: 'app-stats',
  templateUrl: './stats.component.html',
})
export class StatsComponent implements OnInit, OnDestroy {
  status: FeedStatus = { source: 'loading', dataTime: null };
  total = 0;
  airborne = 0;
  onGround = 0;
  avgAltitude = 0;
  avgSpeed = 0;
  maxAltitude: Aircraft | null = null;
  fastest: Aircraft | null = null;

  countries: BarItem[] = [];
  altitudes: BarItem[] = [];
  airports: BarItem[] = [];
  private sub?: Subscription;

  constructor(private data: FlightDataService) {}

  ngOnInit(): void {
    this.data.start();
    this.sub = this.data.aircraft$.subscribe((list) => this.compute(list));
    this.sub.add(this.data.status$.subscribe((s) => (this.status = s)));
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  get dataDate(): Date | null {
    return this.status.dataTime ? new Date(this.status.dataTime * 1000) : null;
  }

  private compute(list: Aircraft[]): void {
    const flying = list.filter((a) => !a.onGround);
    this.total = list.length;
    this.airborne = flying.length;
    this.onGround = list.length - flying.length;

    const plausible = flying.filter(
      (a) => (a.altitude ?? 0) <= MAX_ALTITUDE_M && (a.velocity ?? 0) <= MAX_SPEED_MS
    );
    const alts = plausible.map((a) => a.altitude ?? a.geoAltitude).filter((v): v is number => v != null && v > 0);
    const speeds = plausible.map((a) => a.velocity).filter((v): v is number => v != null && v > 0);
    this.avgAltitude = alts.length ? alts.reduce((s, v) => s + v, 0) / alts.length : 0;
    this.avgSpeed = speeds.length ? (speeds.reduce((s, v) => s + v, 0) / speeds.length) * 3.6 : 0;
    this.maxAltitude = plausible.reduce<Aircraft | null>((m, a) => ((a.altitude ?? 0) > (m?.altitude ?? 0) ? a : m), null);
    this.fastest = plausible.reduce<Aircraft | null>((m, a) => ((a.velocity ?? 0) > (m?.velocity ?? 0) ? a : m), null);

    // Pays d'immatriculation : les 10 premiers.
    const byCountry = new Map<string, number>();
    for (const a of list) {
      if (a.country) {
        byCountry.set(a.country, (byCountry.get(a.country) ?? 0) + 1);
      }
    }
    this.countries = [...byCountry.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([label, value]) => ({ label, value }));

    // Répartition des altitudes par tranches de 1 000 m (avions en vol).
    const bins = new Array(14).fill(0);
    for (const alt of alts) {
      bins[Math.min(13, Math.floor(alt / 1000))]++;
    }
    this.altitudes = bins.map((value, i) => ({
      label: i === 13 ? '13 km+' : `${i} km`,
      value,
    }));

    // Trafic autour des grands aéroports.
    this.airports = AIRPORTS.map((ap) => ({
      label: `${ap.iata} · ${ap.city}`,
      value: list.filter((a) => distanceKm(ap.lat, ap.lng, a.lat, a.lng) <= NEARBY_KM).length,
      link: ['/aeroport', ap.iata],
    }))
      .filter((i) => i.value > 0)
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  }
}
