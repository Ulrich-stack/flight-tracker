import { Component } from '@angular/core';
import { ApiService } from '../../api.service';

@Component({
  selector: 'app-flight-filters',
  templateUrl: './flight-filters.component.html',
  styleUrls: ['./flight-filters.component.css']
})
export class FlightFiltersComponent {
  // Objet regroupant les filtres pour les aéroports
  filters = {
    depAirport: '',
    arrAirport: ''
  };

  // Valeurs pour la période (format ISO: "YYYY-MM-DD" pour la date et "HH:mm" pour l'heure)
  beginDate: string = '';
  beginTime: string = '';
  endDate: string = '';
  endTime: string = '';
  filteredFlights: any[] = [];

  constructor(private apiService: ApiService) {}

  applyFilters() {
    // Vérification que les dates et heures sont renseignées
    if (!this.beginDate || !this.beginTime || !this.endDate || !this.endTime) {
      alert('Veuillez renseigner les dates et heures de début et fin.');
      return;
    }
  
    // Convertir les dates et heures en timestamps UNIX
    const beginTimestamp = this.convertToTimestamp(this.beginDate, this.beginTime);
    const endTimestamp = this.convertToTimestamp(this.endDate, this.endTime);
  
    // Si les deux filtres (départ et arrivée) sont renseignés
    if (this.filters.depAirport && this.filters.arrAirport) {
      // Récupère les vols quittant l'aéroport de départ dans l'intervalle temporel défini
      this.apiService.getFlightsDeparture(this.filters.depAirport, beginTimestamp, endTimestamp)
        .subscribe((result: any[]) => {
          // Filtrer les vols pour ne garder que ceux ayant atterri à l'aéroport d'arrivée spécifié
          const filteredFlights = result.filter((flight) => flight.estArrivalAirport === this.filters.arrAirport);
          console.log('Vols filtrés : ', filteredFlights);
          // Par exemple, assigner aux résultats pour affichage
          this.filteredFlights = filteredFlights;
        });
    } else if (this.filters.depAirport) {
      // Seul l'aéroport de départ est renseigné
      this.apiService.getFlightsDeparture(this.filters.depAirport, beginTimestamp, endTimestamp)
        .subscribe((result: any[]) => {
          console.log('Vols au départ de ' + this.filters.depAirport, result);
          this.filteredFlights = result;
        });
    } else if (this.filters.arrAirport) {
      // Seul l'aéroport d'arrivée est renseigné
      this.apiService.getFlightsArrival(this.filters.arrAirport, beginTimestamp, endTimestamp)
        .subscribe((result: any[]) => {
          console.log('Vols à l\'arrivée de ' + this.filters.arrAirport, result);
          this.filteredFlights = result;
        });
    }
  }
  
  // Fonction utilitaire pour convertir une date et heure en timestamp UNIX (en secondes)
  convertToTimestamp(dateStr: string, timeStr: string): number {
    const dateTime = new Date(`${dateStr}T${timeStr}:00`);
    return Math.floor(dateTime.getTime() / 1000);
  }
  
}
