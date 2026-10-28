import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as L from 'leaflet';
import 'leaflet-rotatedmarker';
import { addBaseLayers, planeIcon, positionedStates } from '../map-utils';

// Carte des vols en fond des pages d'authentification, non interactive.
@Component({
  selector: 'app-map-backdrop',
  template: '<div #map class="backdrop-map"></div>',
  styles: [
    ':host { position: fixed; inset: 0; z-index: 0; }',
    '.backdrop-map { position: absolute; inset: 0; }',
  ],
})
export class MapBackdropComponent implements AfterViewInit, OnDestroy {
  @ViewChild('map') private mapEl!: ElementRef<HTMLDivElement>;
  private map?: L.Map;

  constructor(private http: HttpClient) {}

  ngAfterViewInit(): void {
    this.map = L.map(this.mapEl.nativeElement, {
      zoomControl: false,
      dragging: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      boxZoom: false,
      keyboard: false,
      touchZoom: false,
      attributionControl: true,
    }).setView([47.5, 6], 5);
    // Recentre la carte dans la partie visible, à droite du panneau (420px).
    if (window.innerWidth > 640) {
      this.map.panBy([-210, 0], { animate: false });
    }
    addBaseLayers(this.map);

    const icon = planeIcon('#d9dcdf', 12);
    this.http.get('assets/flightsOpenSky.json').subscribe((response) => {
      for (const s of positionedStates(response)) {
        L.marker([s[6], s[5]], {
          icon,
          interactive: false,
          keyboard: false,
          rotationAngle: s[10] || 0,
          rotationOrigin: 'center',
        } as L.MarkerOptions).addTo(this.map!);
      }
    });
  }

  ngOnDestroy(): void {
    this.map?.remove();
  }
}
