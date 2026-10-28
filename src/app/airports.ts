export interface Airport {
  iata: string;
  icao: string;
  name: string;
  city: string;
  country: string;
  lat: number;
  lng: number;
  /** Fichier d'arrivées disponible dans assets/ (données aviationstack). */
  arrivalsFile?: string;
}

// Principaux aéroports (Europe surtout, plus quelques grands hubs mondiaux).
export const AIRPORTS: Airport[] = [
  { iata: 'CDG', icao: 'LFPG', name: 'Charles de Gaulle', city: 'Paris', country: 'France', lat: 49.0097, lng: 2.5479, arrivalsFile: 'assets/flightsToCDG.json' },
  { iata: 'ORY', icao: 'LFPO', name: 'Orly', city: 'Paris', country: 'France', lat: 48.7262, lng: 2.3652, arrivalsFile: 'assets/flightsToOry.json' },
  { iata: 'NCE', icao: 'LFMN', name: 'Nice Côte d’Azur', city: 'Nice', country: 'France', lat: 43.6584, lng: 7.2159 },
  { iata: 'LYS', icao: 'LFLL', name: 'Lyon-Saint Exupéry', city: 'Lyon', country: 'France', lat: 45.7256, lng: 5.0811 },
  { iata: 'MRS', icao: 'LFML', name: 'Marseille Provence', city: 'Marseille', country: 'France', lat: 43.4393, lng: 5.2214 },
  { iata: 'TLS', icao: 'LFBO', name: 'Toulouse-Blagnac', city: 'Toulouse', country: 'France', lat: 43.6291, lng: 1.3638 },
  { iata: 'BOD', icao: 'LFBD', name: 'Bordeaux-Mérignac', city: 'Bordeaux', country: 'France', lat: 44.8283, lng: -0.7156 },
  { iata: 'NTE', icao: 'LFRS', name: 'Nantes Atlantique', city: 'Nantes', country: 'France', lat: 47.1532, lng: -1.6107 },
  { iata: 'GVA', icao: 'LSGG', name: 'Genève', city: 'Genève', country: 'Suisse', lat: 46.2381, lng: 6.109 },
  { iata: 'ZRH', icao: 'LSZH', name: 'Zurich', city: 'Zurich', country: 'Suisse', lat: 47.4647, lng: 8.5492 },
  { iata: 'BRU', icao: 'EBBR', name: 'Bruxelles', city: 'Bruxelles', country: 'Belgique', lat: 50.901, lng: 4.4844 },
  { iata: 'AMS', icao: 'EHAM', name: 'Schiphol', city: 'Amsterdam', country: 'Pays-Bas', lat: 52.3105, lng: 4.7683 },
  { iata: 'LHR', icao: 'EGLL', name: 'Heathrow', city: 'Londres', country: 'Royaume-Uni', lat: 51.47, lng: -0.4543 },
  { iata: 'LGW', icao: 'EGKK', name: 'Gatwick', city: 'Londres', country: 'Royaume-Uni', lat: 51.1537, lng: -0.1821 },
  { iata: 'DUB', icao: 'EIDW', name: 'Dublin', city: 'Dublin', country: 'Irlande', lat: 53.4264, lng: -6.2499 },
  { iata: 'FRA', icao: 'EDDF', name: 'Francfort', city: 'Francfort', country: 'Allemagne', lat: 50.0379, lng: 8.5622 },
  { iata: 'MUC', icao: 'EDDM', name: 'Munich', city: 'Munich', country: 'Allemagne', lat: 48.3537, lng: 11.775 },
  { iata: 'BER', icao: 'EDDB', name: 'Berlin Brandebourg', city: 'Berlin', country: 'Allemagne', lat: 52.3667, lng: 13.5033 },
  { iata: 'CPH', icao: 'EKCH', name: 'Copenhague', city: 'Copenhague', country: 'Danemark', lat: 55.618, lng: 12.656 },
  { iata: 'OSL', icao: 'ENGM', name: 'Oslo-Gardermoen', city: 'Oslo', country: 'Norvège', lat: 60.1976, lng: 11.1004 },
  { iata: 'ARN', icao: 'ESSA', name: 'Stockholm-Arlanda', city: 'Stockholm', country: 'Suède', lat: 59.6498, lng: 17.9238 },
  { iata: 'HEL', icao: 'EFHK', name: 'Helsinki-Vantaa', city: 'Helsinki', country: 'Finlande', lat: 60.3172, lng: 24.9633 },
  { iata: 'VIE', icao: 'LOWW', name: 'Vienne', city: 'Vienne', country: 'Autriche', lat: 48.1103, lng: 16.5697 },
  { iata: 'PRG', icao: 'LKPR', name: 'Prague', city: 'Prague', country: 'Tchéquie', lat: 50.1008, lng: 14.26 },
  { iata: 'WAW', icao: 'EPWA', name: 'Varsovie-Chopin', city: 'Varsovie', country: 'Pologne', lat: 52.1657, lng: 20.9671 },
  { iata: 'MAD', icao: 'LEMD', name: 'Madrid-Barajas', city: 'Madrid', country: 'Espagne', lat: 40.4983, lng: -3.5676 },
  { iata: 'BCN', icao: 'LEBL', name: 'Barcelone-El Prat', city: 'Barcelone', country: 'Espagne', lat: 41.2974, lng: 2.0833 },
  { iata: 'PMI', icao: 'LEPA', name: 'Palma de Majorque', city: 'Palma', country: 'Espagne', lat: 39.5517, lng: 2.7388 },
  { iata: 'LIS', icao: 'LPPT', name: 'Lisbonne', city: 'Lisbonne', country: 'Portugal', lat: 38.7742, lng: -9.1342 },
  { iata: 'FCO', icao: 'LIRF', name: 'Rome-Fiumicino', city: 'Rome', country: 'Italie', lat: 41.8003, lng: 12.2389 },
  { iata: 'MXP', icao: 'LIMC', name: 'Milan-Malpensa', city: 'Milan', country: 'Italie', lat: 45.6306, lng: 8.7281 },
  { iata: 'VCE', icao: 'LIPZ', name: 'Venise Marco Polo', city: 'Venise', country: 'Italie', lat: 45.5053, lng: 12.3519 },
  { iata: 'ATH', icao: 'LGAV', name: 'Athènes', city: 'Athènes', country: 'Grèce', lat: 37.9364, lng: 23.9445 },
  { iata: 'IST', icao: 'LTFM', name: 'Istanbul', city: 'Istanbul', country: 'Turquie', lat: 41.2753, lng: 28.7519 },
  { iata: 'CMN', icao: 'GMMN', name: 'Mohammed V', city: 'Casablanca', country: 'Maroc', lat: 33.3675, lng: -7.5899 },
  { iata: 'DXB', icao: 'OMDB', name: 'Dubaï', city: 'Dubaï', country: 'Émirats arabes unis', lat: 25.2532, lng: 55.3657 },
  { iata: 'DOH', icao: 'OTHH', name: 'Hamad', city: 'Doha', country: 'Qatar', lat: 25.2731, lng: 51.6081 },
  { iata: 'JFK', icao: 'KJFK', name: 'John F. Kennedy', city: 'New York', country: 'États-Unis', lat: 40.6413, lng: -73.7781 },
  { iata: 'ATL', icao: 'KATL', name: 'Hartsfield-Jackson', city: 'Atlanta', country: 'États-Unis', lat: 33.6407, lng: -84.4277 },
  { iata: 'LAX', icao: 'KLAX', name: 'Los Angeles', city: 'Los Angeles', country: 'États-Unis', lat: 33.9416, lng: -118.4085 },
  { iata: 'ORD', icao: 'KORD', name: 'O’Hare', city: 'Chicago', country: 'États-Unis', lat: 41.9742, lng: -87.9073 },
  { iata: 'YUL', icao: 'CYUL', name: 'Montréal-Trudeau', city: 'Montréal', country: 'Canada', lat: 45.4706, lng: -73.7408 },
  { iata: 'GRU', icao: 'SBGR', name: 'São Paulo-Guarulhos', city: 'São Paulo', country: 'Brésil', lat: -23.4356, lng: -46.4731 },
  { iata: 'HND', icao: 'RJTT', name: 'Haneda', city: 'Tokyo', country: 'Japon', lat: 35.5494, lng: 139.7798 },
  { iata: 'SIN', icao: 'WSSS', name: 'Changi', city: 'Singapour', country: 'Singapour', lat: 1.3644, lng: 103.9915 },
  { iata: 'HKG', icao: 'VHHH', name: 'Hong Kong', city: 'Hong Kong', country: 'Chine', lat: 22.308, lng: 113.9185 },
  { iata: 'SYD', icao: 'YSSY', name: 'Kingsford Smith', city: 'Sydney', country: 'Australie', lat: -33.9399, lng: 151.1753 },
];

export function findAirport(code: string | null | undefined): Airport | undefined {
  if (!code) {
    return undefined;
  }
  const c = code.toUpperCase();
  return AIRPORTS.find((a) => a.iata === c || a.icao === c);
}
