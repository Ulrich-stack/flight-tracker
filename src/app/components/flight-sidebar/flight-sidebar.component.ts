import { Component, Input } from '@angular/core';
import { Flight } from '../../models';

@Component({
  selector: 'app-flight-sidebar',
  templateUrl: './flight-sidebar.component.html',
  styleUrl: './flight-sidebar.component.css'
})
export class FlightSidebarComponent {
  @Input() flight : Flight | null = {};
  @Input() showModal: boolean = false;
}
