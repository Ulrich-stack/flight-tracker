import { Component, Input } from '@angular/core';
import { PreferencesService } from '../preferences.service';

const STATUS_LABELS: Record<string, string> = {
  scheduled: 'Programmé',
  active: 'En vol',
  landed: 'Atterri',
  cancelled: 'Annulé',
  incident: 'Incident',
  diverted: 'Dérouté',
};

@Component({
  selector: 'tr[app-card]',
  templateUrl: './card.component.html',
  styleUrl: './card.component.css'
})
export class CardComponent {
  @Input() flight: any;

  constructor(private prefs: PreferencesService) {}

  get isFavorite(): boolean {
    return this.prefs.isFavoriteFlight(this.flight?.flight?.iata);
  }

  toggleFavorite(): void {
    this.prefs.toggleFavoriteFlight(this.flight.flight.iata);
  }

  get statusLabel(): string {
    return STATUS_LABELS[this.flight?.flight_status] ?? this.flight?.flight_status ?? '—';
  }
}
