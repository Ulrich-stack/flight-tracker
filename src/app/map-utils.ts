import * as L from 'leaflet';

const PLANE_PATH =
  'M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z';

// Avion orienté vers le nord : la rotation du marqueur correspond directement au cap.
export function planeIcon(fill: string, size = 14): L.Icon {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="${fill}" stroke="#121314" stroke-width="1" d="${PLANE_PATH}"/></svg>`;
  return L.icon({
    iconUrl: 'data:image/svg+xml,' + encodeURIComponent(svg),
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

export function addBaseLayers(map: L.Map): void {
  const esri = 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas';
  L.tileLayer(`${esri}/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}`, {
    attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
    minZoom: 2,
    maxZoom: 16,
  }).addTo(map);
  L.tileLayer(`${esri}/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}`, {
    minZoom: 2,
    maxZoom: 16,
  }).addTo(map);
}

// Les états OpenSky sont des tableaux : [5] = longitude, [6] = latitude.
export function positionedStates(response: any, limit = 1000): any[] {
  return response.states.filter((s: any) => s[5] && s[6]).slice(0, limit);
}
