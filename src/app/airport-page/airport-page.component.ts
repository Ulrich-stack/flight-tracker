import { AfterViewInit, Component, ElementRef, NgZone, OnDestroy, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import * as L from 'leaflet';
import { Aircraft, distanceKm } from '../aircraft';
import { Airport, findAirport } from '../airports';
import { ArrivalsService } from '../arrivals.service';
import { FlightDataService } from '../flight-data.service';
import { addBaseLayers } from '../map-utils';
import { PlaneLayer } from '../plane-layer';
import { PreferencesService } from '../preferences.service';

const RADIUS_KM = 50;

interface Nearby {
  aircraft: Aircraft;
  distance: number;
}

@Component({
  selector: 'app-airport-page',
  templateUrl: './airport-page.component.html',
  styles: [
    '.airport-map { position: relative; height: 340px; border-radius: 10px; overflow: hidden; border: 1px solid var(--border); }',
    '.airport-map > div { position: absolute; inset: 0; }',
    '.head-actions { display: flex; gap: 8px; flex-wrap: wrap; }',
    '.board-table { max-height: 480px; overflow: auto; }',
  ],
})
export class AirportPageComponent implements AfterViewInit, OnDestroy {
  @ViewChild('map') private mapEl?: ElementRef<HTMLDivElement>;

  airport?: Airport;
  arrivals: any[] = [];
  nearby: Nearby[] = [];
  onGround = 0;
  avgDelay = 0;
  delayed = 0;
  cancelled = 0;

  private map?: L.Map;
  private planes?: PlaneLayer;
  private ticker?: ReturnType<typeof setInterval>;
  private subs = new Subscription();

  constructor(
    route: ActivatedRoute,
    private data: FlightDataService,
    private arrivalsService: ArrivalsService,
    readonly prefs: PreferencesService,
    private zone: NgZone
  ) {
    this.subs.add(
      route.paramMap.subscribe((params) => {
        this.airport = findAirport(params.get('code'));
        this.loadArrivals();
        this.computeNearby(this.data.current);
        this.recenter();
      })
    );
  }

  ngAfterViewInit(): void {
    this.data.start();
    this.subs.add(this.data.aircraft$.subscribe((list) => this.computeNearby(list)));
    this.initMap();
  }

  ngOnDestroy(): void {
    clearInterval(this.ticker);
    this.subs.unsubscribe();
    this.map?.remove();
  }

  get isFavorite(): boolean {
    return this.prefs.value.favoriteAirport === this.airport?.iata;
  }

  get hasArrivals(): boolean {
    return !!this.airport && this.arrivalsService.hasData(this.airport.iata);
  }

  makeFavorite(): void {
    if (this.airport) {
      this.prefs.setFavoriteAirport(this.airport.iata);
    }
  }

  private loadArrivals(): void {
    this.arrivals = [];
    if (!this.airport) {
      return;
    }
    this.arrivalsService.arrivals(this.airport.iata).subscribe((list) => {
      this.arrivals = list;
      const delays = list.map((f) => f.departure?.delay).filter((d: any): d is number => typeof d === 'number');
      this.avgDelay = delays.length ? delays.reduce((s, d) => s + d, 0) / delays.length : 0;
      this.delayed = delays.filter((d) => d >= 15).length;
      this.cancelled = list.filter((f) => f.flight_status === 'cancelled').length;
    });
  }

  private computeNearby(list: Aircraft[]): void {
    const ap = this.airport;
    if (!ap) {
      this.nearby = [];
      return;
    }
    this.nearby = list
      .map((aircraft) => ({ aircraft, distance: distanceKm(ap.lat, ap.lng, aircraft.lat, aircraft.lng) }))
      .filter((n) => n.distance <= RADIUS_KM)
      .sort((a, b) => a.distance - b.distance);
    this.onGround = this.nearby.filter((n) => n.aircraft.onGround).length;
    this.planes?.setPlanes(this.nearby.map((n) => n.aircraft));
  }

  private initMap(): void {
    if (!this.mapEl || !this.airport) {
      return;
    }
    this.map = L.map(this.mapEl.nativeElement, { zoomControl: true, scrollWheelZoom: false });
    addBaseLayers(this.map);
    this.planes = new PlaneLayer({ position: (a) => this.data.extrapolate(a), size: 16 }).addTo(this.map);
    this.planes.setPlanes(this.nearby.map((n) => n.aircraft));
    this.recenter();
    this.zone.runOutsideAngular(() => {
      this.ticker = setInterval(() => this.planes?.redraw(), 1000);
    });
  }

  private circle?: L.Circle;

  private recenter(): void {
    if (!this.map || !this.airport) {
      return;
    }
    this.circle?.remove();
    this.circle = L.circle([this.airport.lat, this.airport.lng], {
      radius: RADIUS_KM * 1000,
      color: '#3fa58f',
      weight: 1.5,
      fillOpacity: 0.04,
      dashArray: '4 6',
      interactive: false,
    }).addTo(this.map);
    const bounds = L.latLng(this.airport.lat, this.airport.lng).toBounds(RADIUS_KM * 2000);
    this.map.fitBounds(bounds, { padding: [10, 10] });
  }
}
