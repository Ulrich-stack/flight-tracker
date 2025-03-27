export interface FlightsApiData{
  pagination:{
    limit: number,
    offset: number,
    count: number,
    total: number
  },
  data: any[]
}



// export interface Departure {
//   airport: string; // Nom de l'aéroport
//   timezone: string; // Fuseau horaire
//   iata: string; // Code IATA de l'aéroport
//   icao: string; // Code ICAO de l'aéroport
//   terminal?: string; // Terminal (optionnel)
//   gate?: string; // Porte d'embarquement (optionnel)
//   delay?: number; // Délai en minutes (optionnel)
//   scheduled: string; // Heure prévue
//   estimated?: string; // Heure estimée (optionnel)
//   actual?: string; // Heure réelle de départ (optionnel)
//   estimated_runway?: string; // Heure estimée sur la piste (optionnel)
//   actual_runway?: string; // Heure réelle sur la piste (optionnel)
// }

// export interface Arrival {
//   airport: string; // Nom de l'aéroport
//   timezone: string; // Fuseau horaire
//   iata: string; // Code IATA de l'aéroport
//   icao: string; // Code ICAO de l'aéroport
//   terminal?: string; // Terminal (optionnel)
//   gate?: string; // Porte d'arrivée (optionnel)
//   baggage?: string; // Zone de récupération des bagages (optionnel)
//   delay?: number | null; // Délai en minutes (optionnel)
//   scheduled: string; // Heure prévue d'arrivée
//   estimated?: string; // Heure estimée (optionnel)
//   actual?: string | null; // Heure réelle d'arrivée (optionnel)
//   estimated_runway?: string | null; // Heure estimée sur la piste (optionnel)
//   actual_runway?: string | null; // Heure réelle sur la piste (optionnel)
// }

export interface Airline {
  name: string; // Nom de la compagnie aérienne
  iata: string; // Code IATA de la compagnie
  icao: string; // Code ICAO de la compagnie
}

export interface FlightDetails {
  number: string; // Numéro de vol
  iata: string; // Code IATA du vol
  icao: string; // Code ICAO du vol
  codeshared?: any; // Vol partagé (optionnel)
}

// flight.model.ts (exemple)
export interface Flight{
  // --- Identifiants / Général ---
  icao24?: string;          // Code unique OpenSky (ex: "3c4b26")
  callsign?: string;        // Ex: "SWR7XK"
  flightNumber?: string;    // Ex: "LX1234" (numéro de vol IATA/ICAO)
  airlineName?: string;     // Ex: "Swiss International Air Lines"
  airlineCode?: string;     // Code IATA (ex "LX") ou ICAO (ex "SWR")
  flightStatus?: string;    // Ex: "active", "landed", "scheduled"

  // --- Départ / Arrivée (AviationStack) ---
  departureAirport?: string;   // Nom aéroport de départ (ex: "Marco Polo")
  departureIata?: string;      // Code IATA (ex: "VCE")
  departureScheduled?: Date | null;   // Horaire de départ planifié
  departureActual?: Date | null;      // Horaire de départ réel (si dispo)

  arrivalAirport?: string;     // Nom aéroport d’arrivée (ex: "Charles De Gaulle")
  arrivalIata?: string;        // Code IATA (ex: "CDG")
  arrivalScheduled?: Date | null;     // Horaire d’arrivée planifiée
  arrivalEstimated?: Date | null;     // Horaire d’arrivée estimée (si dispo)

  // --- Position & Live Data (OpenSky) ---
  latitude?: number;
  longitude?: number;
  altitude?: number | null;           // Baro altitude (m)
  speed?: number | null;              // Vitesse (km/h)
  heading?: number;            // Cap (°)
  originCountry?: string;      // Pays d’immatriculation (ex: "Switzerland")
}

// export interface Aircraft {
//   registration: string; // Immatriculation de l'avion
//   iata: string; // Code IATA de l'appareil
//   icao: string; // Code ICAO de l'appareil
//   icao24: string; // Code ICAO24 de l'appareil
// }

// export interface LiveFlightData {
//   updated: string; // Dernière mise à jour
//   latitude: number; // Latitude actuelle
//   longitude: number; // Longitude actuelle
//   altitude: number; // Altitude actuelle
//   direction: number; // Direction (cap en degrés)
//   speed_horizontal: number; // Vitesse horizontale (en km/h)
//   speed_vertical: number; // Vitesse verticale (en m/s)
//   is_ground: boolean; // Indique si l'appareil est au sol
// }
