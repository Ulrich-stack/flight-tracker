import * as L from 'leaflet';

export function addBaseLayers(map: L.Map): void {
  const esri = 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas';
  L.tileLayer(`${esri}/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}`, {
    attribution:
      'Vols &copy; <a href="https://opensky-network.org" target="_blank" rel="noopener">OpenSky Network</a> · Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
    minZoom: 2,
    maxZoom: 16,
  }).addTo(map);
  L.tileLayer(`${esri}/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}`, {
    minZoom: 2,
    maxZoom: 16,
  }).addTo(map);
}
