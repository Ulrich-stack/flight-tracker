//   import { Component, Input, OnInit, OnDestroy } from '@angular/core';
//   import { AuthService } from '../auth.service';
//   import { ApiService } from '../api.service';
//   import { Flight } from '../models';
//   import * as L from 'leaflet';
//   import { HttpClient } from '@angular/common/http';
//   // import 'leaflet-rotatedmarker';

//   @Component({
//     selector: 'app-dashboard',
//     templateUrl: './dashboard.component.html',
//     styleUrls: ['./dashboard.component.css'],
//   })
//   export class DashboardComponent implements OnInit {
//     private data: any;
//     private map!: L.Map;
//     private markers: { [key: string]: L.Marker } = {};

//     @Input() flights?: Flight[];
//     @Input() user?: any;

//     // Si vous avez besoin de l'URL (ce n'est plus vraiment utile si on délègue tout au service)
//     // private apiUrl = 'http://api.aviationstack.com/v1/flights?access_key=VOTRE_CLE_AVIATIONSTACK';

//     constructor(
//       private authService: AuthService,
//       private api: ApiService,
//       private http: HttpClient
//     ) {}

//     logout() {
//       this.authService.logOut();
//       console.log('User logged out');
//     }

//     ngOnInit(): void {
//       this.initMap();
//       this.fetchFlights();

//       // Mise à jour automatique toutes les 10 secondes (facultatif):
//       // setInterval(() => this.fetchFlights(), 10000);
//     }

//     // Initialiser la carte Leaflet
//     private initMap(): void {
//       this.map = L.map('map', { zoomControl: false }).setView(
//         [48.8566, 2.3522],
//         5
//       ); // Centrée sur Paris

//       L.tileLayer('//{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png', {
//         attribution: '',
//         minZoom: 1,
//         maxZoom: 20,
//       }).addTo(this.map);
//     }

//     // Récupérer les données des vols via le service
//     private fetchFlights(): void {
//       // On appelle la méthode du service qui retourne un Observable
//       this.api.getFlights().subscribe(
//         (response) => {
//           // response devrait contenir un objet { data: [...] }
//           this.data = response[0];
//           console.log("Vols: ", this.data);
          
//           this.updateMap(this.data);
//         },
//         (error) => {
//           console.error('Erreur lors de la récupération des vols:', error);
//         }
//       );
//       // this.http.get('../assets/flights.json').subscribe((respone) => {
//       //   this.data = respone;
//       //   console.log("Vols: ", this.data);
        
//       //   this.updateMap(this.data);
//       // });
//     }

//     openMaps(lat: number, lng: number): void {

//       console.log(lat,' ' ,lng)
//       // Exemple 1 : ouvre la recherche "lat, lng" dans Google Maps
//       const url = `https://www.google.com/maps?q=${lat},${lng}`;
    
//       // Exemple 2 : vous pouvez aussi utiliser l’API paramétrée
//       // const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    
//       window.open(url, '_blank'); // Ouvre dans un nouvel onglet
//     }

//     private getPlaneIcon(): L.Icon {
//       return L.icon({
//         iconUrl: 'assets/avion.png',
//         iconSize: [10, 10],
//         iconAnchor: [0, 20],
//         popupAnchor: [0, -10],
//       });
//     }

//     // Ajouter les marqueurs sur la carte
//     private updateMap(flightsResponse: any): void {
//       // Accéder à la liste des vols depuis `flightsResponse.data`
//       const flights = flightsResponse.data;

//       // Supprimer tous les marqueurs existants sur la carte avant d'ajouter les nouveaux
//       this.map.eachLayer((layer: any) => {
//         if (
//           layer instanceof L.Marker ||
//           layer instanceof L.CircleMarker ||
//           layer instanceof L.Polyline
//         ) {
//           this.map.removeLayer(layer);
//         }
//       });

//       // Parcourir chaque vol
//       flights.forEach((flight: any) => {
//         // Vérifier si des données live sont disponibles pour afficher un marqueur en temps réel
//         if (flight.live && flight.live.latitude && flight.live.longitude) {
//           const markerOptions = {
//             icon: this.getPlaneIcon(),
//             rotationAngle: flight.live.direction || 0,
//             rotationOrigin: 'center',
//           };
//           const liveMarker = L.marker(
//             [flight.live.latitude, flight.live.longitude],
//             markerOptions
//           ).addTo(this.map);

//           liveMarker.bindPopup(`
//                       <span style ="color: #808080; font-size: 10px">${
//                         flight.flight.iata || 'N/A'
//                       }</span><br>
//             <div style="display: flex; flex-direction: column; align-items: center; gap: 10px;font-size: 14px">
//             <div style = "  border: 1px solid #ccc; border-radius: 5px; padding: 10px; margin-top: 10px">
//             <div style="margin-bottom: 10px">
//               <div style="display: flex; align-items: center; gap: 8px">
//                 <img src="assets/plane-up.png" style="width: 30px; height: 30px;"/>
//                 <div style="display: flex; flex-direction: column; gap: 8px">
//                 <span style = " color: #808080">Aéroport de départ</span>
//                 <span style= "font-weight: 600">${flight.departure.airport || 'Non spécifié'} (${
//             flight.departure.iata || ''
//           })</span>
//                 </div>
//               </div>
//             </div>
//                       <div style= "border-top: 1px solid #ccc; padding-top: 10px">
//               <div style="display: flex; align-items: center; gap: 5px">
//                 <img src="assets/plane-down.png" style="width: 30px; height: 30px;"/>
//                 <div style="display: flex; flex-direction: column; gap: 8px">
//                 <span style = " color: #808080">Aéroport d'arrivée</span>
//                 <span style= "font-weight: 600" >${flight.arrival.airport || 'Non spécifié'} (${
//             flight.arrival.iata || ''
//           })</span>
//                 </div>
//               </div>
//             </div>
//             </div>

//             <div style = "display: flex; justify-content: space-between; align-items: center; width: 100%; gap:10px">
//             <div style = "display: flex; flex-direction: column; border: 1px solid #ccc; border-radius: 5px; width: 100%; padding: 5px">
//                       <span style="color: #808080;">Départ</span>
//               <span style= "font-weight: 600">
//                 ${
//                   flight.departure.scheduled
//                     ? new Date(flight.departure.scheduled).toLocaleString(
//                         'fr-FR',
//                         {
//                           hour: '2-digit',
//                           minute: '2-digit',
//                           day: '2-digit',
//                           month: 'short',
//                         }
//                       )
//                     : 'N/A'
//                 }
//               </span>
//             </div>

//                 <div style= "display: flex; flex-direction: column; border: 1px solid #ccc; border-radius: 5px; width: 100%; padding: 5px">
//                             <span style="color: #808080;">Arrivée</span>
//               <span style= "font-weight: 600">
//                 ${
//                   flight.arrival.scheduled
//                     ? new Date(flight.arrival.scheduled).toLocaleString('fr-FR', {
//                         hour: '2-digit',
//                         minute: '2-digit',
//                         day: '2-digit',
//                         month: 'short',
//                       })
//                     : 'N/A'
//                 }
//               </span>
//                 </div>
//             </div>
//             <a target="_blank"   href="https://www.google.com/maps?q=${flight.live.latitude},${flight.live.longitude}" style = "cursor: pointer; width: 100%; background-color: #023430; color: white; padding: 8px; text-decoration: none; display: flex; align-items: center; border-radius: 4px; justify-content: center" >Ouvrir maps                 <img src="assets/carte.png" style="width: 25px; height: 25px;"/>
//  </a>

//             </div>
            
//           `);
//         } else {
//           // Ajouter un marqueur pour l'aéroport de départ si disponible
//           if (
//             flight.departure?.airport &&
//             flight.departure.latitude &&
//             flight.departure.longitude
//           ) {
//             const departureMarker = L.marker([
//               flight.departure.latitude,
//               flight.departure.longitude,
//             ]).addTo(this.map);

//             departureMarker.bindPopup(`
//               <b>Vol : ${flight.flight.iata || 'N/A'}</b><br>
//               Départ : ${flight.departure.airport || 'Non spécifié'} (${
//               flight.departure.iata || ''
//             })<br>
//               Statut : ${flight.flight_status || 'N/A'}<br>
//             `);
//           }

//           // Ajouter un marqueur pour l'aéroport d'arrivée si disponible
//           if (
//             flight.arrival?.airport &&
//             flight.arrival.latitude &&
//             flight.arrival.longitude
//           ) {
//             const arrivalMarker = L.marker([
//               flight.arrival.latitude,
//               flight.arrival.longitude,
//             ]).addTo(this.map);

//             arrivalMarker.bindPopup(`
//               <b>Vol : ${flight.flight.iata || 'N/A'}</b><br>
//               Arrivée : ${flight.arrival.airport || 'Non spécifié'} (${
//               flight.arrival.iata || ''
//             })<br>
//               Statut : ${flight.flight_status || 'N/A'}<br>
//             `);
//           }
//         }
//       });
//     }
//   }





import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../auth.service';
import { ApiService } from '../api.service';
import { HttpClient } from '@angular/common/http';
import * as L from 'leaflet';
import 'leaflet-rotatedmarker';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit, OnDestroy {
  private data: any | null = null;
  private map!: L.Map;
  private markers: { [key: string]: L.Marker } = {};

  @Input() flightsByAirport: any | null = null;
  @Input() flights?: any[];
  @Input() user?: any;
  isModalOpen = false;

  currentTime: string = '';  // 🕒 Propriété pour stocker l'heure
  private clockInterval: any; // Intervalle pour l'horloge

  constructor(
    private authService: AuthService,
    private api: ApiService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.initMap();
    this.fetchFlights();
    this.fetchFlightsByAirport('CDG');

    // 🕒 Initialisation de l'horloge en temps réel
    this.updateClock();
    this.clockInterval = setInterval(() => {
      this.updateClock();
    }, 1000);
  }

  ngOnDestroy(): void {
    // 🛑 Nettoyage de l'intervalle pour éviter les fuites de mémoire
    if (this.clockInterval) {
      clearInterval(this.clockInterval);
    }
  }

  private updateClock(): void {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    this.currentTime = `${hours}:${minutes}:${seconds}`;
  }

  toggleModal(): void {
    this.isModalOpen = !this.isModalOpen;
  }

  logout(): void {
    this.authService.logOut();
    console.log('User logged out');
  }

  private initMap(): void {
    this.map = L.map('map', { zoomControl: false }).setView(
      [48.8566, 2.3522],
      5
    );

    L.tileLayer('//{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png', {
      attribution: '',
      minZoom: 1,
      maxZoom: 20,
    }).addTo(this.map);
  }

  private fetchFlights(): void {
    this.http.get('../assets/flightsOpenSky.json').subscribe((response) => {
      this.data = response;
      console.log("Vols: ", this.data);
      this.updateMap(this.data);
    });
  }

  private fetchFlightsByAirport(airport: string): void {
    this.http.get<any>('../assets/flightsToCDG.json').subscribe((response) => {
      this.flightsByAirport = response.data.slice(0, 5);
      console.log("Vols par aéroport: ", this.flightsByAirport);
    });
  }

  openMaps(lat: number, lng: number): void {
    const url = `https://www.google.com/maps?q=${lat},${lng}`;
    window.open(url, '_blank');
  }

  private getPlaneIcon(): L.Icon {
    return L.icon({
      iconUrl: 'assets/avion.png',
      iconSize: [10, 10],
      iconAnchor: [20, 20],
      popupAnchor: [0, -10],
    });
  }

  private updateMap(flightsResponse: any): void {
    const flights = flightsResponse.states.filter((flight: any) => flight[5] && flight[6]).slice(0, 1000);
    console.log("Vols triés: ", flights);
    
    this.map.eachLayer((layer: any) => {
      if (layer instanceof L.Marker) {
        this.map.removeLayer(layer);
      }
    });

    flights.forEach((flight: any) => {
      if (flight[5] && flight[6]) {
        const markerOptions = {
          icon: this.getPlaneIcon(),
          rotationAngle: flight[10] || 0,
          rotationOrigin: 'center',
        };
        const liveMarker = L.marker(
          [flight[5], flight[6]],
          markerOptions
        ).addTo(this.map);

        liveMarker.bindPopup(`
          <span style="color: #808080; font-size: 10px">${flight[1] || 'N/A'}</span><br>
          <div style="display: flex; flex-direction: column; align-items: center; gap: 10px; font-size: 14px">
            <div style="border: 1px solid #ccc; border-radius: 5px; padding: 10px; margin-top: 10px">
              <div style="margin-bottom: 10px">
                <div style="display: flex; align-items: center; gap: 8px">
                  <img src="assets/plane-up.png" style="width: 30px; height: 30px;"/>
                  <div style="display: flex; flex-direction: column; gap: 8px">
                    <span style="color: #808080">Pays d'origine</span>
                    <span style="font-weight: 600">${flight[2] || 'Non spécifié'}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div style="display: flex; justify-content: space-between; align-items: center; width: 100%; gap:10px">
              <div style="display: flex; flex-direction: column; border: 1px solid #ccc; border-radius: 5px; width: 100%; padding: 5px">
                <span style="color: #808080;">Altitude</span>
                <span style="font-weight: 600">
                  ${flight[7] ? flight[7].toFixed(0) + ' m' : 'N/A'}
                </span>
              </div>
              
              <div style="display: flex; flex-direction: column; border: 1px solid #ccc; border-radius: 5px; width: 100%; padding: 5px">
                <span style="color: #808080;">Vitesse</span>
                <span style="font-weight: 600">
                  ${flight[9] ? (flight[9] * 3.6).toFixed(0) + ' km/h' : 'N/A'}
                </span>
              </div>
            </div>
            
            <div style="display: flex; flex-direction: column; border: 1px solid #ccc; border-radius: 5px; width: 100%; padding: 5px">
              <span style="color: #808080;">Direction</span>
              <span style="font-weight: 600">
                ${flight[10] ? flight[10].toFixed(0) + '°' : 'N/A'}
              </span>
            </div>
            
            <a target="_blank" href="https://www.google.com/maps?q=${flight[5]},${flight[6]}" 
               style="cursor: pointer; width: 100%; background-color: #023430; color: white; padding: 8px; text-decoration: none; display: flex; align-items: center; border-radius: 4px; justify-content: center">
              Ouvrir maps
              <img src="assets/carte.png" style="width: 25px; height: 25px;"/>
            </a>
          </div>
        `);
      }
    });
  }
}
