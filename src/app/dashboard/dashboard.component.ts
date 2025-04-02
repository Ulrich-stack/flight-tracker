import { Component, Input, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { ApiService } from '../api.service';
import * as L from 'leaflet';
import { HttpClient } from '@angular/common/http';
import 'leaflet-rotatedmarker';
import { Flight, UserData } from '../models';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  private data: any | null = null;
  private map!: L.Map;

  @Input() flightsByAirport: any | null = null;
  @Input() flights?: any[];
  @Input() user?: any;

  userId!: any;
  userData!: UserData;
  isModalOpen = false;
  sibebarOpen = false;
  searchValueICAO: string = '';
  currentFlightInfo: Flight | null = {};
  sidebarFlightInfoOpen = false;
  showDropdown: boolean = false;
  favoriteFlights: string[] = [];
  filteredFavorites: string[] = []; // résultats des vols filtrés

  constructor(
    private authService: AuthService,
    private api: ApiService,
    private http: HttpClient
  ) {}

  hideSidebar() {
    this.sibebarOpen = false;
  }

  toggleSidebar() {
    this.sibebarOpen = true;
    this.sidebarFlightInfoOpen = false;
  }

  toggleModal() {
    this.isModalOpen = true;
  }

  toggleFlightInfoModal() {
    this.sidebarFlightInfoOpen = true;
  }

  hideFlightInfoModal() {
    this.sidebarFlightInfoOpen = false;
  }

  logout() {
    this.authService.logOut();
    console.log('User logged out');
  }

  ngOnInit(): void {
    this.initMap();
    this.fetchFlights();

    this.authService.userData$.subscribe((user) => {
      if (user) {
        this.userData = user;
        this.favoriteFlights = user.favoriteFlights;
        this.filteredFavorites = [...this.favoriteFlights];
        this.userId = user.uid;
        console.log('UID récupéré :', this.userId);
        this.fetchFlightsByAirport(this.userData.favoriteAirport.code);
      } else {
        console.warn('Aucun utilisateur connecté !');
      }
    });
  }

  /**
   * Initialise la carte Leaflet
   */
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
    // this.http.get('../assets/flightsOpenSky.json').subscribe((response) => {
    //   // on utilise un fichier json avec des exemples pour la demo
    //   this.data = response;
    //   console.log('Vols récupérés :', this.data);

    //   this.updateMap(this.data);
    // });

    this.api.getFlights().subscribe((response) => {
      this.data = response;
      this.updateMap(this.data);
    });
  }

  private fetchFlightsByAirport(airport: string): void {
    // this.http.get<any>('../assets/flightsToCDG.json').subscribe((response) => {
    //   // On ne prend que 5 exemples
    //   this.flightsByAirport = response.data.slice(0, 5);
    //   console.log('Vols par aéroport : ', this.flightsByAirport);
    // });
    // this.api.getFlightsByAirpot(airport).subscribe((response) =>{
    //   this.flightsByAirport = response.data;
    //   console.log('Vols par aéroport : ', this.flightsByAirport);
    // })
  }

  private getPlaneIcon(): L.Icon {
    return L.icon({
      iconUrl: 'assets/avion.png',
      iconSize: [15, 15],
      iconAnchor: [0, 0],
      popupAnchor: [5, 0],
    });
  }

  /**
   * Options Leaflet pour les popups
   */
  customOptions = {
    minWidth: 200,
    className: 'custom',
  };

  /**
   * Construit le contenu HTML pour le popup d'un vol (à partir de l'array states)
   */
  private buildPopupContent(flight: any, isFavorite: boolean): string {
    const starClass = isFavorite ? 'fas' : 'far'; // plein ou vide
    return `
    <div>
      <span style="color: #808080; font-size: 10px; font-weight: 600">
        ${flight[1] || 'N/A'}
      </span>
      <button id="fav-btn-${flight[0]}"
        title="${isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}"
        style="border: none; background: none; cursor: pointer; font-size: 12px; color: gold">
        <i class="${starClass} fa-star"></i>
      </button>
    </div>

    <div style="display: flex; flex-direction: column; align-items: center; gap: 10px; font-size: 12px; margin-top: 5px">

      <div style="border: 1px solid #ccc; border-radius: 5px; padding: 5px; width: 100%">
        <div style="display: flex; align-items: center; gap: 8px">
          <img src="assets/plane-up.png" style="width: 20px; height: 20px;" />
          <div style="display: flex; flex-direction: column; gap: 8px">
            <span style="color: #808080">Pays d'origine</span>
            <span style="font-weight: 600">${flight[2] || 'Non spécifié'}</span>
          </div>
        </div>
      </div>

      <div style="display: flex; justify-content: space-between; width: 100%; gap:10px">
        <div style="flex:1; display: flex; flex-direction: column; border: 1px solid #ccc; border-radius: 5px; padding: 5px">
          <span style="color: #808080;">Altitude</span>
          <span style="font-weight: 600">${
            flight[7] ? flight[7].toFixed(0) + ' m' : 'N/A'
          }</span>
        </div>
        <div style="flex:1; display: flex; flex-direction: column; border: 1px solid #ccc; border-radius: 5px; padding: 5px">
          <span style="color: #808080;">Vitesse</span>
          <span style="font-weight: 600">${
            flight[9] ? (flight[9] * 3.6).toFixed(0) + ' km/h' : 'N/A'
          }</span>
        </div>
      </div>

      <div style="width: 100%; display: flex; flex-direction: column; border: 1px solid #ccc; border-radius: 5px; padding: 5px">
        <span style="color: #808080;">Direction</span>
        <span style="font-weight: 600">${
          flight[10] ? flight[10].toFixed(0) + '°' : 'N/A'
        }</span>
      </div>

      <div style="width: 100%; display: flex; justify-content: center; align-items: center; gap: 5px">
        <a
          target="_blank"
          href="https://www.google.com/maps?q=${flight[6]},${flight[5]}"
          style="cursor: pointer; width: 100%; background-color: #023430; color: white; padding: 8px; text-decoration: none; display: flex; align-items: center; border-radius: 4px; gap: 5px; justify-content: center">
          <span>Ouvrir maps</span>
          <img src="assets/carte.png" style="width: 15px;" />
        </a>

        <button id="info-btn-${flight[0]}"
          style=" padding: 8px; border: none; border-radius: 2px; background: none; display: flex; align-items: center; justify-content: center; cursor: pointer">
          <img src="assets/info.png" style="width: 20px;" />
        </button>
      </div>
    </div>
  `;
  }

  private updateMap(flightsResponse: any): void {
    const flights = flightsResponse.states
      .filter((flight: any) => flight[5] && flight[6])
      .slice(0, 1000);
    console.log('Vols triés: ', flights);

    // Supprimer tous les markers existants avant d'ajouter les nouveaux
    this.map.eachLayer((layer: any) => {
      if (layer instanceof L.Marker) {
        this.map.removeLayer(layer);
      }
    });

    flights.forEach((flight: any) => {
      if (flight[5] && flight[6]) {
        const icao24 = flight[0]; // L'identifiant ICAO unique
        const markerOptions = {
          icon: this.getPlaneIcon(),
          rotationAngle: flight[10] || 0,
          rotationOrigin: 'center',
        };
        const isFav = this.userData?.favoriteFlights?.includes(flight[0]);

        // On crée le marker
        const marker = L.marker([flight[6], flight[5]], markerOptions)
          .bindPopup(this.buildPopupContent(flight, isFav), this.customOptions)
          .addTo(this.map);

        marker.on('popupopen', () => {
          const btn = document.getElementById(`info-btn-${flight[0]}`);
          if (btn) {
            btn.addEventListener('click', () => {
              this.showFlightInfo(flight);
            });
          }

          const favBtn = document.getElementById(`fav-btn-${flight[0]}`);
          if (favBtn) {
            favBtn.addEventListener('click', async () => {
              const icon = favBtn.querySelector('i');
              const flightId = flight[0];
              const isFav = this.userData?.favoriteFlights?.includes(flightId);

              // Mise à jour du firestore
              const updated = this.authService.toggleFlightFavorite(
                this.userData.uid,
                flightId,
                this.userData.favoriteFlights || []
              );

              // Mise à jour de l'icone
              if (icon) {
                icon.classList.toggle('fas', !isFav); // si c’était favori, on retire
                icon.classList.toggle('far', isFav);
                favBtn.title = isFav
                  ? 'Ajouter aux favoris'
                  : 'Retirer des favoris';
              }

              this.userData.favoriteFlights = updated;
              this.filteredFavorites = updated;
            });
          }

          this.api.getFlightByIcao24(icao24).subscribe(
            (response) => {
              const track = response.track;
              if (!track || !track.path || track.path.length === 0) {
                console.log(`Aucune trajectoire disponible pour ${icao24}`);
                return;
              }

              // On construit le tableau lat/lng
              const latlngs = track.path.map((waypoint: any) => [
                waypoint[1], // latitude
                waypoint[2], // longitude
              ]);

              // On trace la polyline
              const polyline = L.polyline(latlngs, {
                // Exemple : color: 'blue', weight: 3
              }).addTo(this.map);

              // On stocke la polyline dans une propriété du marker
              (marker as any)._flightPolyline = polyline;
            },
            (err) => {
              console.error('Erreur track :', err);
            }
          );
        });

        //Quand on ferme le popup => on supprime la trajectoire --
        marker.on('popupclose', () => {
          const polyline = (marker as any)._flightPolyline;
          if (polyline) {
            this.map.removeLayer(polyline);
            (marker as any)._flightPolyline = null;
          }
        });
      }
    });
  }

  private showFlightInfo(openSkyFlightInfo: any) {
    console.log('Voici openskyflightinfo: ', openSkyFlightInfo);

    // this.api.getFlightInfoByIcao24("AI8105").subscribe(response => {
    //   const aviationStackFlightInfo = response;
    //   this.currentFlightInfo = this.buildFlightModel(
    //     openSkyFlightInfo,
    //     aviationStackFlightInfo
    //   );

    //   console.log("Aviation: ",aviationStackFlightInfo);
    // })

    this.http.get<any>('assets/flight.json').subscribe((response) => {
      const aviationStackFlightInfo = response;
      this.currentFlightInfo = this.buildFlightModel(
        openSkyFlightInfo,
        aviationStackFlightInfo
      );
    });

    this.toggleFlightInfoModal();
    this.hideSidebar();
    console.log(
      'Flight info: ',
      this.currentFlightInfo,
      ' ',
      this.sidebarFlightInfoOpen
    );
  }

  searchFlight(): void {
    const icao = this.searchValueICAO.toLowerCase();
    if (!icao) return;

    this.api.getFlightByIcao24(icao).subscribe(
      (response) => {
        const states = response.states.states;
        const track = response.track;
        if (!states || states.length === 0) {
          alert('Avion non trouvé ou hors couverture.');
          return;
        }

        // Premier état de l'avion
        const flight = states[0];
        const longitude = flight[5];
        const latitude = flight[6];
        if (!longitude || !latitude) {
          alert('Position invalide pour cet avion.');
          return;
        }

        const markerOptions = {
          icon: this.getPlaneIcon(),
          rotationAngle: flight[10] || 0,
          rotationOrigin: 'center',
        };
        const marker = L.marker([latitude, longitude], markerOptions).addTo(
          this.map
        );
        const isFav = this.userData?.favoriteFlights?.includes(flight[0]);

        marker.bindPopup(this.buildPopupContent(flight, isFav)).openPopup();
        this.map.setView([latitude, longitude], 8);

        if (track && track.path && track.path.length > 0) {
          const latlngs = track.path.map((waypoint: any) => [
            waypoint[1], // latitude
            waypoint[2], // longitude
          ]);

          const polyline = L.polyline(latlngs).addTo(this.map);

          marker.on('popupopen', () => {
            // Récupérer le bouton par son ID
            const btn = document.getElementById(`info-btn-${flight[0]}`);
            if (btn) {
              btn.addEventListener('click', () => {
                this.showFlightInfo(flight);
              });
            }
          });

          marker.on('popupclose', () => {
            this.map.removeLayer(polyline);
          });
        }
      },
      (err) => {
        console.error(err);
        alert('Le vol n’existe pas ou erreur API.');
      }
    );
  }

  filterFavorites() {
    const search = this.searchValueICAO.toLowerCase();
    this.filteredFavorites = this.favoriteFlights.filter((f) =>
      f.toLowerCase().includes(search)
    );
  }

  selectFavorite(flight: string) {
    this.searchValueICAO = flight;
    this.showDropdown = false;
    this.searchFlight();
  }

  private buildFlightModel(
    openSkyData: any,
    aviationStackData: any
  ): Flight | null {
    // 1) Vérifier qu’on a bien au moins un état côté OpenSky
    if (!openSkyData || openSkyData.length === 0) {
      return null;
    }
    const state = openSkyData;

    // 2) Vérifier qu’on a au moins un vol dans AviationStack
    if (!aviationStackData.data || aviationStackData.data.length === 0) {
      return null;
    }
    const avFlight = aviationStackData.data[0];

    console.log('Dans la fonction! Open: ', state, 'av: ', avFlight);

    // 3) Extraire les champs OpenSky
    const icao24 = state[0] || '';
    const callsign = (state[1] || '').trim();
    const originCountry = state[2] || '';
    const longitude = state[5] || null;
    const latitude = state[6] || null;
    const altitude = state[7] || null;
    const velocityMs = state[9] || null; // m/s
    const heading = state[10] || null;

    // Convertir la vitesse en km/h
    const speedKmh = velocityMs ? Math.round(velocityMs * 3.6) : null;

    // 4) Extraire les champs AviationStack
    const flightStatus = avFlight.flight_status;
    const airlineName = avFlight.airline?.name;
    const airlineCode = avFlight.airline?.iata || avFlight.airline?.icao;
    const flightNumber = avFlight.flight?.iata || avFlight.flight?.icao;

    const departureAirport = avFlight.departure?.airport || '';
    const departureIata = avFlight.departure?.iata || '';
    const departureScheduled = avFlight.departure?.scheduled
      ? new Date(avFlight.departure.scheduled)
      : null;
    const departureActual = avFlight.departure?.actual
      ? new Date(avFlight.departure.actual)
      : null;

    const arrivalAirport = avFlight.arrival?.airport || '';
    const arrivalIata = avFlight.arrival?.iata || '';
    const arrivalScheduled = avFlight.arrival?.scheduled
      ? new Date(avFlight.arrival.scheduled)
      : null;
    const arrivalEstimated = avFlight.arrival?.estimated
      ? new Date(avFlight.arrival.estimated)
      : null;

    // 5) Construire l’objet FlightModel final
    const flight: Flight = {
      // Identifiants
      icao24,
      callsign,
      flightNumber,
      airlineName,
      airlineCode,
      flightStatus,

      // Départ / Arrivée
      departureAirport,
      departureIata,
      departureScheduled,
      departureActual,
      arrivalAirport,
      arrivalIata,
      arrivalScheduled,
      arrivalEstimated,

      // Position & Live
      latitude,
      longitude,
      altitude: altitude ? Math.round(altitude) : null,
      speed: speedKmh ?? null,
      heading: heading ?? null,
      originCountry,
    };
    console.log('A la fin: ', flight);

    return flight;
  }

  hideDropdownWithDelay() {
    setTimeout(() => (this.showDropdown = false), 150);
  }
}
