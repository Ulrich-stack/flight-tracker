import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api.service';
import { ChartConfiguration } from 'chart.js';
import { HttpClient } from '@angular/common/http';
import { BOUNDING_BOXES } from '../utils/bounding-boxes';
import { AuthService } from '../auth.service';
import { UserData } from '../models';

@Component({
  selector: 'app-stats-page',
  templateUrl: './stats-page.component.html',
  styleUrls: ['./stats-page.component.css'],
})
export class StatsPageComponent implements OnInit {
  // ─── 🔐 Auth & Données utilisateur ─────────────────────
  userId!: string;
  pendingUserData: UserData | null = null;

  // ─── 📊 Statistiques globales ──────────────────────────
  globalStats = { inFlight: 0, avgAltitude: 0, avgSpeed: 0 };
  isLoadingGlobal = true;

  // ─── 🛫 Aéroports ──────────────────────────────────────
  selectedAirport: { name: string; code: string } = { name: 'Francfort', code: 'EDDF' };
  airportList: any[] = [];
  filteredAirports = this.airportList;
  airportSearch = '';
  showAirportDropdown = false;
  airportStats = { arrivals: 0, departures: 0 };
  isLoadingAirport = true;

  // ─── 🌍 Pays ───────────────────────────────────────────
  availableCountries = [{ name: '', code: '' }];
  selectedCountries: { name: string; code: string; count: number }[] = [];
  filteredCountries: { name: string; code: string }[] = [];
  countrySearch = '';
  showCountryInput = false;
  showCountryDropdown = false;
  isLoadingCountry = true;

  // ─── 🧁 Top compagnies ─────────────────────────────────
  showNoDataMessage = false;
  isLoadingCompanies = true;



  constructor(private api: ApiService, private http: HttpClient, private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.userData$.subscribe((user) => {
      if (user) {
        this.userId = user.uid;
        this.pendingUserData = user;
  
        // 1. Charger les aéroports PUIS appliquer le favori
        this.loadAirports(() => {
          if (user.favoriteAirport) {
            this.selectedAirport = user.favoriteAirport;
            this.airportSearch = `${user.favoriteAirport.name} (${user.favoriteAirport.code})`;
            this.onAirportChange();
          }
        });
  
        // 2. Charger les pays PUIS appliquer les favoris
        this.loadCountry(() => {
          if (user.favoriteCountries?.length > 0) {
            this.selectedCountries = user.favoriteCountries.map((code) => {
              const match = this.availableCountries.find((c) => c.code === code);
              return {
                name: match?.name || code,
                code,
                count: 0
              };
            });
            this.loadCountryStats();
          }
        });
      }
    });
  
    this.loadGlobalStats();
    this.loadCompanyStats(this.selectedAirport.code);
  }

  //-----------------------------Chargement des données------------------------------//

  loadAirports(onLoaded?: () => void): void {
    this.http.get<any[]>('assets/airports.json').subscribe((data: any[]) => {
      this.airportList = data.map((a) => ({
        code: a.icao,
        name: a.name,
      }));
      this.filteredAirports = this.airportList;
  
      if (onLoaded) onLoaded();
    });
  }
  
  loadCountry(onLoaded?: () => void): void {
    this.http.get<any[]>('assets/countries.json').subscribe((countries) => {
      this.availableCountries = countries;
      this.filteredCountries = countries;
  
      if (onLoaded) onLoaded();
    });
  }

  loadGlobalStats() {
    this.isLoadingGlobal = true;
    this.api.getFlights().subscribe((res: any) => {
      const inAir = res.states.filter((f: any) => f[8] === false);
      this.globalStats.inFlight = inAir.length;

      const altitudes = inAir.map((f: any) => f[7] || 0);
      const speeds = inAir.map((f: any) => f[9] || 0);

      this.globalStats.avgAltitude = Math.floor(
        altitudes.reduce((a: number, b: number) => a + b, 0) / altitudes.length
      );
      this.globalStats.avgSpeed = Math.floor(
        speeds.reduce((a: number, b: number) => a + b, 0) / speeds.length
      );
      this.isLoadingGlobal = false;
    });
  }
  
  loadAirportStats(airport: string) {
    this.isLoadingAirport = true;
    const now = Math.floor(Date.now() / 1000);
    const begin = now - 21600; // 6 heures

    this.api.getFlightsArrival(airport, begin, now).subscribe({
      next: (res: any[]) => {
        this.airportStats.arrivals = res.length;
      },
      error: () => {
        this.airportStats.arrivals = 0;
        this.isLoadingAirport = false
      },
      complete: () => {
        this.isLoadingAirport = false;
      }
    });
    
    this.api.getFlightsDeparture(airport, begin, now).subscribe({
      next: (res: any[]) => {
        this.airportStats.departures = res.length;
      },
      error: () => {
        this.airportStats.departures = 0;
        this.isLoadingAirport = false;
      },
      complete: () => {
        this.isLoadingAirport = false;
      }
    });
  }

  loadCountryStats() {
    this.isLoadingCountry = true;
  
    let completed = 0;
    this.selectedCountries.forEach((country, index) => {
      const coords = this.getBoundingBox(country.name);
      if (!coords) return;
  
      this.api.getFlightsByBoundingBox(coords).subscribe((res: any) => {
        const inAir = res.states.filter((f: any) => f[8] === false);
        this.selectedCountries[index].count = inAir.length;
        completed++;
  
        if (completed === this.selectedCountries.length) {
          this.isLoadingCountry = false;
        }
      });
    });
  }
  

  loadCompanyStats(airport: string) {
    this.isLoadingCompanies = true;
    const now = Math.floor(Date.now() / 1000);
    const begin = now - 21600; // 6h

    this.api.getFlightsArrival(airport, begin, now).subscribe({
      next: (flights: any[]) => {
        if (!flights || flights.length === 0) {
          this.showNoDataMessage = true;
          this.isLoadingCompanies = false;
          return;
        }

        this.showNoDataMessage = false;

        const companyCounts: { [code: string]: number } = {};
        flights.forEach((flight) => {
          const callsign = flight.callsign?.trim();
          if (callsign && callsign.length >= 3) {
            const code = callsign.slice(0, 3).toUpperCase();
            companyCounts[code] = (companyCounts[code] || 0) + 1;
          }
        });

        const sorted = Object.entries(companyCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 8);

        this.companyChartData = {
          labels: sorted.map(([code]) => this.getAirlineName(code)),
          datasets: [
            {
              data: sorted.map(([, count]) => count),
              backgroundColor: this.generateColors(sorted.length),
            },
          ],
        };

        this.isLoadingCompanies = false;
      },
      error: (err) => {
        this.showNoDataMessage = true;
        this.isLoadingCompanies = false;
        console.error('Erreur lors du chargement des compagnies', err);
      },
    });
  }

  //---------------------Filtres et sélections----------------------------//
  
  filterAirports() {
    const search = (this.airportSearch || '').toLowerCase();
    console.log('Search: ', search);
    this.filteredAirports = this.airportList
      .filter(
        (a) =>
          a.name?.toLowerCase().includes(search) ||
          a.code?.toLowerCase().includes(search)
      )
      .slice(0, 20); // Limite à 20 résultats
  }

    
  filterCountries() {
    const search = (this.countrySearch || '').toLowerCase();
  
    this.filteredCountries = this.availableCountries
      .filter(c =>
        c.name.toLowerCase().includes(search) &&
        !this.selectedCountries.find(sel => sel.name === c.name)
      )
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  getBoundingBox(name: string): number[] | null {
    return BOUNDING_BOXES[name] || null;
  }
  
  //--------------------Sélection d'aéroport---------------------------//
  
  selectAirport(airport: { code: string; name: string }) {
    this.selectedAirport = airport;
    this.airportSearch = `${airport.name} (${airport.code})`;
    this.showAirportDropdown = false;
    this.onAirportChange();

    this.authService.updateUserPreferences(this.userId, {
      favoriteAirport: {
        name: airport.name,
        code: airport.code
      }
    });
  }

  onAirportChange() {
    this.loadAirportStats(this.selectedAirport.code);
    this.loadCompanyStats(this.selectedAirport.code);
  }

  //--------------Gestion des pays-------------------//

  addCountry(country: { name: string, code: string }) {
    this.selectedCountries.push({ ...country, count: 0 });
    this.showCountryDropdown = false;
    this.loadCountryStats(); // ou juste charger celui-ci
    this.availableCountries = this.availableCountries.filter(c => c.name !== country.name);

    const countryCodes = this.selectedCountries.map(c => c.code);
    this.authService.updateUserPreferences(this.userId, {
      favoriteCountries: countryCodes
    });
  }



  selectCountry(country: { name: string, code: string }) {
    const alreadyExists = this.selectedCountries.find(c => c.name === country.name);
    if (alreadyExists) return;
  
    this.selectedCountries.push({ ...country, count: 0 });
    this.availableCountries = this.availableCountries.filter(c => c.name !== country.name);
    this.countrySearch = '';
    this.showCountryInput = false;
    this.showCountryDropdown = false;
    this.loadCountryStats();

    const countryCodes = this.selectedCountries.map(c => c.code);
    this.authService.updateUserPreferences(this.userId, {
      favoriteCountries: countryCodes
    });
  
  }

  isCountrySelected(name: string): boolean {
    return this.selectedCountries.some(c => c.name === name);
  }

  removeCountry(countryToRemove: { name: string, code: string }) {
    this.selectedCountries = this.selectedCountries.filter(
      c => c.name !== countryToRemove.name
    );
    this.availableCountries.push({ name: countryToRemove.name, code: countryToRemove.code });
    this.availableCountries.sort((a, b) => a.name.localeCompare(b.name));

    const countryCodes = this.selectedCountries.map(c => c.code);
    this.authService.updateUserPreferences(this.userId, {
      favoriteCountries: countryCodes
    });
  
  }

//------------------Autres--------------------//

  cancelCountryInput() {
    this.showCountryInput = false;
    this.countrySearch = '';
    this.showCountryDropdown = false;
  }

  companyChartData: ChartConfiguration<'doughnut'>['data'] = {
    labels: [],
    datasets: [{ data: [], backgroundColor: [] }],
  };
  companyChartOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    plugins: {
      legend: {
        labels: {
          color: 'white',
          font: { size: 14 },
        },
      },
    },
  };

  getAirlineName(code: string): string {
    const map: { [key: string]: string } = {
      AFR: 'Air France',
      UAL: 'United',
      DLH: 'Lufthansa',
      BAW: 'British Airways',
      KLM: 'KLM',
      AAL: 'American Airlines',
      EIN: 'Aer Lingus',
      THY: 'Turkish Airlines',
      DLA: 'DHL Aviation',
    };
    return map[code] || code;
  }

  generateColors(n: number): string[] {
    const baseColors = [
      '#1a8d75',
      '#28a745',
      '#007bff',
      '#ffc107',
      '#dc3545',
      '#6f42c1',
      '#20c997',
      '#fd7e14',
    ];
    return baseColors.slice(0, n);
  }
  
  toggleCountryInput() {
    this.showCountryInput = !this.showCountryInput;
  }
  
  hideDropdownWithDelay() {
    setTimeout(() => (this.showAirportDropdown = false), 150);
  }

  hideCountryDropdownWithDelay() {
    setTimeout(() => this.showCountryDropdown = false, 150);
  }
}
