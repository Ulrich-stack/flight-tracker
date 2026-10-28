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





import { Component, ElementRef, NgZone, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { Subscription } from 'rxjs';
import * as L from 'leaflet';
import { Aircraft, flightLevel } from '../aircraft';
import { AIRPORTS, findAirport } from '../airports';
import { ArrivalsService } from '../arrivals.service';
import { FeedStatus, FlightDataService } from '../flight-data.service';
import { addBaseLayers } from '../map-utils';
import { ALTITUDE_BANDS, PLANE_COLOR, PlaneLayer, altitudeColor } from '../plane-layer';
import { PreferencesService } from '../preferences.service';

/** Tranches du filtre d'altitude : 'ground' puis les index de ALTITUDE_BANDS. */
type BandKey = 'ground' | 0 | 1 | 2 | 3;

const SQUAWK_MEANING: Record<string, string> = {
  '7500': 'Détournement',
  '7600': 'Panne radio',
  '7700': 'Urgence',
};

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit, OnDestroy {
  private map!: L.Map;
  private planes!: PlaneLayer;
  private trackLine?: L.Polyline;
  private airportMarker?: L.Marker;
  private resizeObserver?: ResizeObserver;
  private ticker?: ReturnType<typeof setInterval>;
  private subs = new Subscription();
  private pendingId: string | null = null;

  readonly bands = ALTITUDE_BANDS;
  readonly arrivalAirports = AIRPORTS.filter((a) => a.arrivalsFile);
  readonly flightLevel = flightLevel;

  all: Aircraft[] = [];
  visible: Aircraft[] = [];
  countries: { name: string; count: number }[] = [];
  status: FeedStatus = { source: 'loading', dataTime: null };

  filtersOpen = false;
  colorByAltitude = false;
  country = '';
  hiddenBands = new Set<BandKey>();

  selected: Aircraft | null = null;
  notFound: string | null = null;
  trackPoints = 0;
  trackLoading = false;
  linkCopied = false;
  /** Heure courante (s), rafraîchie chaque seconde pour « il y a N s ». */
  nowSec = Math.floor(Date.now() / 1000);

  // Sur petit écran, le tableau démarre replié pour laisser la place à la carte.
  boardCollapsed = window.innerWidth < 760;
  arrivalsAirport = 'CDG';
  arrivals: any[] = [];

  constructor(
    private data: FlightDataService,
    readonly prefs: PreferencesService,
    private arrivalsService: ArrivalsService,
    private route: ActivatedRoute,
    private location: Location,
    private zone: NgZone,
    private host: ElementRef<HTMLElement>
  ) {}

  ngOnInit(): void {
    this.initMap();
    this.data.start();

    this.pendingId = this.route.snapshot.paramMap.get('icao24');

    this.subs.add(this.data.status$.subscribe((s) => (this.status = s)));
    this.subs.add(
      this.data.aircraft$.subscribe((list) => {
        this.all = list;
        this.countries = this.countByCountry(list);
        this.applyFilters();
        this.refreshSelection();
      })
    );
    this.subs.add(
      this.prefs.prefs$.subscribe((p) => {
        if (p.favoriteAirport !== this.arrivalsAirport || !this.arrivals.length) {
          this.arrivalsAirport = p.favoriteAirport;
          this.loadArrivals();
        }
      })
    );

    // Les avions avancent à l'estime chaque seconde, hors de la détection de changements.
    this.zone.runOutsideAngular(() => {
      this.ticker = setInterval(() => {
        this.planes.redraw();
        if (this.selected) {
          this.zone.run(() => (this.nowSec = Math.floor(Date.now() / 1000)));
        }
      }, 1000);
    });
  }

  ngOnDestroy(): void {
    clearInterval(this.ticker);
    this.subs.unsubscribe();
    this.resizeObserver?.disconnect();
    this.map?.remove();
  }

  // ---------- Filtres ----------

  isBandVisible(key: BandKey): boolean {
    return !this.hiddenBands.has(key);
  }

  toggleBand(key: BandKey): void {
    this.hiddenBands.has(key) ? this.hiddenBands.delete(key) : this.hiddenBands.add(key);
    this.applyFilters();
  }

  setCountry(value: string): void {
    this.country = value;
    this.applyFilters();
  }

  setColorByAltitude(on: boolean): void {
    this.colorByAltitude = on;
    this.planes.setColor(on ? altitudeColor : () => PLANE_COLOR);
  }

  resetFilters(): void {
    this.hiddenBands.clear();
    this.country = '';
    this.applyFilters();
  }

  get filtersActive(): boolean {
    return this.hiddenBands.size > 0 || !!this.country;
  }

  private bandOf(a: Aircraft): BandKey {
    if (a.onGround) {
      return 'ground';
    }
    const alt = a.altitude ?? a.geoAltitude ?? 0;
    return ALTITUDE_BANDS.findIndex((b) => alt < b.max) as BandKey;
  }

  private applyFilters(): void {
    this.visible = this.all.filter(
      (a) =>
        (!this.country || a.country === this.country) &&
        !this.hiddenBands.has(this.bandOf(a))
    );
    this.planes.setPlanes(this.visible);
  }

  private countByCountry(list: Aircraft[]): { name: string; count: number }[] {
    const counts = new Map<string, number>();
    for (const a of list) {
      if (a.country) {
        counts.set(a.country, (counts.get(a.country) ?? 0) + 1);
      }
    }
    return [...counts.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }

  // ---------- Sélection d'un avion ----------

  clearSelection(): void {
    this.selected = null;
    this.notFound = null;
    this.planes.setSelected(null);
    this.trackLine?.remove();
    this.trackLine = undefined;
    this.location.replaceState('/');
  }

  private select(a: Aircraft, fly = false): void {
    this.selected = a;
    this.notFound = null;
    this.linkCopied = false;
    this.planes.setSelected(a.icao24);
    this.location.replaceState(`/vol/${a.icao24}`);
    if (fly) {
      this.map.flyTo(this.data.extrapolate(a), Math.max(this.map.getZoom(), 7), { duration: 0.8 });
    }
    this.loadTrack(a);
  }

  /** Met à jour l'avion sélectionné quand de nouvelles données arrivent. */
  private refreshSelection(): void {
    if (this.pendingId && this.all.length) {
      const target = this.data.find(this.pendingId);
      if (target) {
        this.select(target, true);
      } else if (this.status.source !== 'loading') {
        this.notFound = this.pendingId;
      }
      this.pendingId = null;
      return;
    }
    if (this.selected) {
      const fresh = this.data.find(this.selected.icao24);
      if (fresh) {
        this.selected = fresh;
      }
    }
  }

  private loadTrack(a: Aircraft): void {
    this.trackLine?.remove();
    this.trackPoints = 0;
    this.trackLoading = true;
    this.data.track(a.icao24).subscribe((points) => {
      if (this.selected?.icao24 !== a.icao24) {
        return;
      }
      this.trackLoading = false;
      if (points.length < 2) {
        return;
      }
      this.trackPoints = points.length;
      this.trackLine = L.polyline(
        points.map((p) => [p[1], p[2]] as L.LatLngTuple),
        { color: '#3fa58f', weight: 2.5, opacity: 0.9, interactive: false }
      ).addTo(this.map);
    });
  }

  get isFollowed(): boolean {
    return !!this.selected && this.prefs.isFollowed(this.selected.icao24);
  }

  toggleFollow(): void {
    if (this.selected) {
      this.prefs.toggleFollow(this.selected.icao24, this.selected.callsign);
    }
  }

  async copyLink(): Promise<void> {
    if (!this.selected) {
      return;
    }
    const url = `${window.location.origin}/vol/${this.selected.icao24}`;
    try {
      await navigator.clipboard.writeText(url);
      this.linkCopied = true;
      setTimeout(() => (this.linkCopied = false), 2000);
    } catch {
      window.prompt('Lien vers ce vol :', url);
    }
  }

  squawkMeaning(code: string | null): string | null {
    return code ? SQUAWK_MEANING[code] ?? null : null;
  }

  verticalLabel(rate: number | null): string {
    if (rate == null || Math.abs(rate) < 0.5) {
      return 'En palier';
    }
    return rate > 0 ? 'En montée' : 'En descente';
  }

  ageLabel(timestamp: number | null): string {
    if (!timestamp) {
      return '—';
    }
    const age = Math.max(0, this.nowSec - timestamp);
    if (age < 60) {
      return `il y a ${age} s`;
    }
    if (age < 3600) {
      return `il y a ${Math.floor(age / 60)} min`;
    }
    return new Date(timestamp * 1000).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' });
  }

  // ---------- Arrivées ----------

  setArrivalsAirport(iata: string): void {
    this.prefs.setFavoriteAirport(iata);
  }

  get arrivalsAirportName(): string {
    return findAirport(this.arrivalsAirport)?.name ?? this.arrivalsAirport;
  }

  private loadArrivals(): void {
    const airport = findAirport(this.arrivalsAirport);
    this.arrivalsService.arrivals(this.arrivalsAirport).subscribe((list) => (this.arrivals = list));
    if (airport && this.map) {
      this.placeAirportMarker(airport.lat, airport.lng, airport.iata);
    }
  }

  // ---------- Carte ----------

  private initMap(): void {
    const mapEl = this.host.nativeElement.querySelector<HTMLElement>('#map')!;
    this.map = L.map(mapEl, { zoomControl: false, worldCopyJump: true }).setView([48.8566, 2.3522], 5);
    L.control.zoom({ position: 'bottomright' }).addTo(this.map);
    L.control.scale({ position: 'bottomleft', imperial: false, maxWidth: 120 }).addTo(this.map);
    addBaseLayers(this.map);

    this.planes = new PlaneLayer({
      position: (a) => this.data.extrapolate(a),
      color: () => PLANE_COLOR,
      interactive: true,
      onSelect: (a) => this.zone.run(() => (a ? this.select(a) : this.clearSelection())),
    }).addTo(this.map);

    const airport = findAirport(this.prefs.value.favoriteAirport);
    if (airport) {
      this.placeAirportMarker(airport.lat, airport.lng, airport.iata);
    }

    // Le tableau des arrivées se replie : la carte doit recalculer sa taille.
    this.resizeObserver = new ResizeObserver(() => this.map.invalidateSize());
    this.resizeObserver.observe(mapEl);
  }

  private placeAirportMarker(lat: number, lng: number, code: string): void {
    this.airportMarker?.remove();
    this.airportMarker = L.marker([lat, lng], {
      icon: L.divIcon({
        className: 'airport-symbol',
        html: `<svg viewBox="0 0 16 16" width="16" height="16"><circle cx="8" cy="8" r="5" fill="#121314" stroke="#3fa58f" stroke-width="2.5"/></svg><span>${code}</span>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      }),
      interactive: false,
      zIndexOffset: 500,
    }).addTo(this.map);
  }
}
