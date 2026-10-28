import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { distanceKm } from '../aircraft';
import { AIRPORTS, Airport } from '../airports';
import { FlightDataService } from '../flight-data.service';
import { PreferencesService } from '../preferences.service';

interface Row {
  airport: Airport;
  nearby: number;
}

@Component({
  selector: 'app-airports-page',
  templateUrl: './airports-page.component.html',
})
export class AirportsPageComponent implements OnInit, OnDestroy {
  filter = '';
  rows: Row[] = [];
  private sub?: Subscription;

  constructor(private data: FlightDataService, readonly prefs: PreferencesService) {}

  ngOnInit(): void {
    this.data.start();
    this.sub = this.data.aircraft$.subscribe((list) => {
      this.rows = AIRPORTS.map((airport) => ({
        airport,
        nearby: list.filter((a) => distanceKm(airport.lat, airport.lng, a.lat, a.lng) <= 50).length,
      })).sort((a, b) => b.nearby - a.nearby);
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  get filtered(): Row[] {
    const q = this.filter.trim().toLowerCase();
    if (!q) {
      return this.rows;
    }
    return this.rows.filter(({ airport: a }) =>
      [a.iata, a.icao, a.name, a.city, a.country].some((v) => v.toLowerCase().includes(q))
    );
  }
}
