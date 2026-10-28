import { Component, Input } from '@angular/core';

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
  isFavorite = false;

  get statusLabel(): string {
    return STATUS_LABELS[this.flight?.flight_status] ?? this.flight?.flight_status ?? '—';
  }
}
