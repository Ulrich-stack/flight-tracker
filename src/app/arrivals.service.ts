import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of, shareReplay } from 'rxjs';
import { findAirport } from './airports';

/**
 * Arrivées par aéroport. Les données viennent d'exports aviationstack enregistrés
 * dans assets/ : seuls CDG et ORY en ont pour l'instant.
 */
@Injectable({ providedIn: 'root' })
export class ArrivalsService {
  private cache = new Map<string, Observable<any[]>>();

  constructor(private http: HttpClient) {}

  hasData(iata: string): boolean {
    return !!findAirport(iata)?.arrivalsFile;
  }

  arrivals(iata: string): Observable<any[]> {
    const file = findAirport(iata)?.arrivalsFile;
    if (!file) {
      return of([]);
    }
    if (!this.cache.has(file)) {
      this.cache.set(
        file,
        this.http.get<any>(file).pipe(
          map((res) => res?.data ?? []),
          catchError(() => of([])),
          shareReplay(1)
        )
      );
    }
    return this.cache.get(file)!;
  }
}
