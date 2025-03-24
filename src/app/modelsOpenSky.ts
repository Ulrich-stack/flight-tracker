export interface FlightsApiData {
    time: number; // Timestamp du dernier rafraîchissement des données
    states: FlightState[]; // Liste des avions suivis
  }
  
  export interface FlightState {
    icao24: string; // Code unique de l'avion (immatriculation hexadécimale)
    callsign?: string | null; // Numéro de vol (s'il est disponible)
    origin_country: string; // Pays d'origine de l'avion
    time_position?: number | null; // Dernière mise à jour de la position
    last_contact: number; // Dernière mise à jour des données
    longitude?: number | null; // Longitude de l'avion
    latitude?: number | null; // Latitude de l'avion
    baro_altitude?: number | null; // Altitude barométrique (mètres)
    on_ground: boolean; // Indique si l'avion est au sol
    velocity?: number | null; // Vitesse horizontale (m/s)
    heading?: number | null; // Cap (direction en degrés)
    vertical_rate?: number | null; // Taux de montée/descente (m/s)
    sensors?: any | null; // Capteurs (toujours null actuellement)
    geo_altitude?: number | null; // Altitude géométrique (mètres)
    squawk?: string | null; // Code transpondeur (s'il est disponible)
    spi: boolean; // Indique si l'identification spéciale SPI est activée
    position_source: number; // Source des données de position (0: ADS-B, 1: ASTERIX, 2: MLAT, 3: FLARM)
  }
  