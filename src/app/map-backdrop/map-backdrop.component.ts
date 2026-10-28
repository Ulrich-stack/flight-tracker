import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as L from 'leaflet';
import { Aircraft, fromOpenSkyState } from '../aircraft';
import { addBaseLayers } from '../map-utils';
import { PlaneLayer } from '../plane-layer';

// Carte des vols en fond des pages d'authentification, non interactive.
// Elle lit l'instantané local pour ne pas consommer le quota OpenSky.
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

    const layer = new PlaneLayer({ position: (a) => [a.lat, a.lng], size: 12 }).addTo(this.map);
    this.http.get<any>('assets/flightsOpenSky.json').subscribe((res) => {
      layer.setPlanes(
        (res?.states ?? []).map(fromOpenSkyState).filter((a: Aircraft | null) => a !== null)
      );
    });
  }

  ngOnDestroy(): void {
    this.map?.remove();
  }
}
