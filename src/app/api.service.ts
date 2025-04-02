import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin, Observable } from 'rxjs';
import { FlightsApiData } from './modelsOpenSky';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  // URL de base pour l'endpoint "states" d'OpenSky
  private baseUrlStates: string = 'https://opensky-network.org/api/states/all';
  // URL de base pour les endpoints de vols (arrivée/départ) d'OpenSky
  // Remarque : ces endpoints nécessitent une période temporelle
  private baseUrlOpenSkyFlights: string =
    'https://opensky-network.org/api/flights';

  // API Aviationstack (pour les infos complémentaires)
  private baseUrlAviationSky: string = 'https://api.aviationstack.com/v1';
  private apiKey: string = '5381652b51416c715b2eb2900eca0dfe';

  constructor(private http: HttpClient) {}

  public getFlights(): Observable<FlightsApiData> {
    return this.http.get<FlightsApiData>(this.baseUrlStates);
  }

  public getFlightsByAirpot(icao: string): Observable<any> {
    const params = {
      access_key: this.apiKey,
      arr_icao: icao,
      limit: 5,
    };
    return this.http.get<any>(this.baseUrlAviationSky + '/flights', { params });
  }

  public getFlightByIcao24(icao24: string): Observable<any> {
    const statesUrl = `https://opensky-network.org/api/states/all?icao24=${icao24}`;
    const trackUrl = `https://opensky-network.org/api/tracks/all?icao24=${icao24}&time=0`;

    const states$ = this.http.get<any>(statesUrl);
    const track$ = this.http.get<any>(trackUrl);

    console.log('Response: ', states$, ' ', track$);

    return forkJoin({
      states: states$,
      track: track$,
    });
  }

  public getFlightInfoByIcao24(icao: string): Observable<any> {
    return this.http.get<any>(
      this.baseUrlAviationSky +
        '/flights?access_key=' +
        this.apiKey +
        '&flight_iata=' +
        icao
    );
  }

  getFlightsArrival(
    airport: string,
    begin: number,
    end: number
  ): Observable<any> {
    return this.http.get(
      `https://opensky-network.org/api/flights/arrival?airport=${airport}&begin=${begin}&end=${end}`
    );
  }

  getFlightsDeparture(
    airport: string,
    begin: number,
    end: number
  ): Observable<any> {
    return this.http.get(
      `https://opensky-network.org/api/flights/departure?airport=${airport}&begin=${begin}&end=${end}`
    );
  }

  getFlightsByBoundingBox([
    lamin,
    lomin,
    lamax,
    lomax,
  ]: number[]): Observable<any> {
    return this.http.get(
      `https://opensky-network.org/api/states/all?lamin=${lamin}&lomin=${lomin}&lamax=${lamax}&lomax=${lomax}`
    );
  }
}
