// import { HttpClient } from '@angular/common/http';
// import { Injectable } from '@angular/core';
// import { Observable } from 'rxjs';
// import { FlightsApiData } from './models';

// @Injectable({
//   providedIn: 'root',
// })
// export class ApiService {
//   constructor(private http: HttpClient) {}

//   private baseUrlOpenSky: string = 'https://api.aviationstack.com/v1';
//   private apiKey: string = '5381652b51416c715b2eb2900eca0dfe';
// //
// //https://api.aviationstack.com/v1

//   public getFlights(): Observable<FlightsApiData> {
//     return this.http.get<FlightsApiData>(
//       this.baseUrlOpenSky + '/flights?access_key=' + this.apiKey
//     );

//   }
// }


import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin, Observable } from 'rxjs';
import { FlightsApiData } from './modelsOpenSky';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private baseUrlOpenSky: string = 'https://opensky-network.org/api/states/all';

    private baseUrlAviationSky: string = 'https://api.aviationstack.com/v1';
  private apiKey: string = '5381652b51416c715b2eb2900eca0dfe';

  constructor(private http: HttpClient) {}

  public getFlights(): Observable<FlightsApiData> {
    return this.http.get<FlightsApiData>(this.baseUrlOpenSky);
  }

  public getFlightsByAirpot(airport: string): Observable<any> {
    return this.http.get<any>(
            this.baseUrlOpenSky + '/flights?access_key=' + this.apiKey + '&arr_iata=' + airport
    )
  }
  public getFlightByIcao24(icao24: string): Observable<any> {
         
    const statesUrl = `https://opensky-network.org/api/states/all?icao24=${icao24}`;
    const trackUrl = `https://opensky-network.org/api/tracks/all?icao24=${icao24}&time=0`;

    const states$ = this.http.get<any>(statesUrl);
    const track$ = this.http.get<any>(trackUrl);

    console.log("Response: ", states$, " ", track$);
    
    return forkJoin({
      states: states$,
      track: track$
    })
  }

  public getFlightInfoByIcao24(icao: string): Observable<any>{ /*utilise aviationstack pour avoir des infos supplémentaires sur l'appareil
      Je n'ai pas mis dans getFlightByIcao car cette dernière est beaucoup plus sollicitée
    */

      return this.http.get<any>(
              this.baseUrlAviationSky + '/flights?access_key=' + this.apiKey + '&flight_iata=' + icao
      )

  }
}