import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Flight } from '../../models';

@Component({
  selector: 'app-flight-sidebar',
  templateUrl: './flight-sidebar.component.html',
  styleUrl: './flight-sidebar.component.css'
})
export class FlightSidebarComponent {
  @Input() flight: Flight | null = null;
  @Input() showModal: boolean = false;
  @Output() closeModal = new EventEmitter<void>(); // 👈 ici

  getTranslatedStatus(status: string): { label: string; class: string } {
    switch (status) {
      case 'scheduled': return { label: 'Prévu', class: 'scheduled' };
      case 'active': return { label: 'En cours', class: 'active' };
      case 'landed': return { label: 'Atterri', class: 'landed' };
      case 'cancelled': return { label: 'Annulé', class: 'cancelled' };
      case 'incident': return { label: 'Incident', class: 'incident' };
      case 'diverted': return { label: 'Détourné', class: 'diverted' };
      default: return { label: 'Inconnu', class: 'unknown' };
    }
  }

  handleClose() {
    this.closeModal.emit(); // 👈 notifie le parent
  }
}
