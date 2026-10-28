/** Un avion tel que renvoyé par OpenSky (/states/all), sous forme lisible. */
export interface Aircraft {
  icao24: string;
  callsign: string;
  country: string;
  /** Horodatage (s) de la dernière position reçue. */
  timePosition: number | null;
  lastContact: number;
  lat: number;
  lng: number;
  /** Altitude barométrique (m). */
  altitude: number | null;
  geoAltitude: number | null;
  onGround: boolean;
  /** Vitesse sol (m/s). */
  velocity: number | null;
  /** Cap vrai (degrés, 0 = nord). */
  heading: number | null;
  /** Vitesse verticale (m/s, positive en montée). */
  verticalRate: number | null;
  squawk: string | null;
}

/** Point de trajectoire : [horodatage s, lat, lng, altitude m]. */
export type TrackPoint = [number, number, number, number | null];

// Index des champs d'un état OpenSky : https://openskynetwork.github.io/opensky-api/rest.html
export function fromOpenSkyState(s: any[]): Aircraft | null {
  if (s[5] == null || s[6] == null) {
    return null;
  }
  return {
    icao24: s[0],
    callsign: (s[1] ?? '').trim(),
    country: s[2] ?? '',
    timePosition: s[3],
    lastContact: s[4],
    lng: s[5],
    lat: s[6],
    altitude: s[7],
    onGround: !!s[8],
    velocity: s[9],
    heading: s[10],
    verticalRate: s[11],
    geoAltitude: s[13],
    squawk: s[14],
  };
}

export function flightLevel(altitudeMeters: number): string {
  return 'FL' + Math.round((altitudeMeters * 3.28084) / 100).toString().padStart(3, '0');
}

/** Distance orthodromique en km. */
export function distanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const toRad = Math.PI / 180;
  const dLat = (lat2 - lat1) * toRad;
  const dLng = (lng2 - lng1) * toRad;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * toRad) * Math.cos(lat2 * toRad) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(a));
}
