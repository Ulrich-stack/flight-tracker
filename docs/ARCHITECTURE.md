# Architecture

Vue d'ensemble de CLOUDtrack : d'où viennent les données, comment elles circulent et
pourquoi le code est organisé ainsi.

## Vue d'ensemble

```
                       ┌──────────────────────────────┐
  Navigateur           │ Angular (NgModule)           │
                       │                              │
                       │  FlightDataService ──────────┼──► /opensky/states/all  (toutes les 60 s)
                       │    │  aircraft$ / status$     │    /opensky/tracks/all  (au clic sur un avion)
                       │    ▼                          │
                       │  Dashboard ─► PlaneLayer      │    (canvas Leaflet)
                       │  Topbar (recherche, état)     │
                       │  Stats, Aéroports, Profil     │
                       │                              │
                       │  PreferencesService ─────────┼──► localStorage + Firestore preferences/{uid}
                       │  AuthService ────────────────┼──► Firebase Auth + Firestore users
                       │  ArrivalsService ────────────┼──► assets/flightsTo*.json (aviationstack)
                       └──────────────────────────────┘
                                     │ /opensky/**
              ┌──────────────────────┴───────────────────────┐
   Dev :      │ ng serve + proxy.conf.json                   │
   Prod :     │ Firebase Hosting ─► Cloud Function `opensky` │ (cache CDN 30 s)
              └──────────────────────┬───────────────────────┘
                                     ▼
                         opensky-network.org/api
```

## Sources de données

| Donnée | Source | Fréquence | Code |
|---|---|---|---|
| Positions des avions | OpenSky `/states/all` | 60 s | `flight-data.service.ts` |
| Trajectoire d'un avion | OpenSky `/tracks/all` | au clic | `flight-data.service.ts` |
| Instantané de secours | `src/assets/flightsOpenSky.json` | statique | `flight-data.service.ts` |
| Arrivées CDG / ORY | exports aviationstack dans `src/assets/` | statique | `arrivals.service.ts` |
| Aéroports | liste en dur (47 aéroports) | statique | `airports.ts` |
| Fond de carte | tuiles Esri Dark Gray Canvas | à la demande | `map-utils.ts` |

### Pourquoi un proxy pour OpenSky

L'API OpenSky ne renvoie un en-tête CORS que pour son propre domaine : le navigateur
bloque tout appel direct. Toutes les requêtes passent donc par le chemin relatif
`/opensky/**`, relayé :

- **en développement** par `ng serve` (`proxy.conf.json`, lancé par `npm start`) ;
- **en production** par Firebase Hosting, qui redirige vers la Cloud Function
  `opensky` (`functions/index.js`).

Le client utilise le même chemin dans les deux cas : aucun code ne dépend de
l'environnement.

La fonction n'accepte que deux routes et une liste fixe de paramètres. Elle pose un
`Cache-Control` (`s-maxage=30` pour les positions, 60 pour les trajectoires) : le CDN
de Hosting sert la même réponse à tous les visiteurs pendant ce délai. Si
`OPENSKY_CLIENT_ID` et `OPENSKY_CLIENT_SECRET` sont définis dans `functions/.env`,
elle s'authentifie (OAuth2 client credentials) pour un quota plus élevé.

### Quota et repli

En anonyme, OpenSky accorde environ 400 crédits par jour et une requête mondiale en
coûte 4. `FlightDataService` :

1. interroge `/states/all` au démarrage puis toutes les **60 s** ;
2. se met en **pause quand l'onglet est caché** (`visibilitychange`) et reprend au retour ;
3. en cas d'erreur (429 quota, réseau), charge **l'instantané local** une fois, publie
   `status.source = 'sample'` avec un message, et réessaie le direct toutes les 5 min.

La barre du haut et le dashboard affichent cet état (« En direct » / « Données d'exemple »).
Les pages d'authentification affichent toujours l'instantané pour ne pas consommer de quota.

## Modèle de données

Les états OpenSky sont des tableaux positionnels. `fromOpenSkyState()` (`aircraft.ts`)
les convertit en `Aircraft` lisible (`icao24`, `callsign`, `lat`, `lng`, `altitude`,
`velocity`, `heading`, `verticalRate`, `onGround`…). Attention à l'ordre OpenSky :
**index 5 = longitude, index 6 = latitude**.

Le reste du code ne manipule que `Aircraft` ; seul `aircraft.ts` connaît le format brut.

## Rendu de la carte

Avec environ 10 000 avions, un marqueur DOM par avion serait trop lourd. `PlaneLayer`
(`plane-layer.ts`) est un calque Leaflet qui dessine tous les avions sur **un seul
canvas** :

- volet dédié `planes` (z-index 450) : au-dessus des tracés, sous les marqueurs d'aéroport ;
- redessin regroupé par `requestAnimationFrame`, uniquement les avions visibles ;
- détection du clic par recherche du point le plus proche (rayon 12 px) ;
- taille des avions proportionnelle au zoom ; l'avion sélectionné est dessiné en dernier,
  plus grand, en vert.

**Navigation à l'estime** : entre deux actualisations, `FlightDataService.extrapolate()`
calcule la position actuelle à partir de la dernière position, de la vitesse et du cap.
Le dashboard redessine chaque seconde **hors de la zone Angular** (`runOutsideAngular`)
pour ne pas déclencher la détection de changements.

## Routes

| Route | Composant | Protégée |
|---|---|---|
| `/login`, `/signin` | `LoginComponent`, `RegisterComponent` | redirige vers `/` si connecté |
| `/forgot-password`, `/verification-email` | pages simples | non |
| `/` | `DashboardComponent` | oui |
| `/vol/:icao24` | `DashboardComponent` (avion sélectionné, lien partageable) | oui |
| `/aeroports`, `/aeroport/:code` | `AirportsPageComponent`, `AirportPageComponent` | oui |
| `/statistiques` | `StatsComponent` | oui |
| `/profil` | `ProfilePageComponent` | oui |

Les guards viennent de `@angular/fire/auth-guard`. `AppComponent` masque la barre du haut
sur les pages d'authentification.

Quand on sélectionne un avion sur la carte, l'URL passe à `/vol/:icao24` par
`Location.replaceState`, sans recréer le composant.

## Services

| Service | Rôle |
|---|---|
| `FlightDataService` | flux des avions, état de la source, extrapolation, trajectoires, historique local |
| `PreferencesService` | aéroport favori, vols favoris, vols suivis, notifications |
| `AlertsService` | compare les états successifs des vols suivis : décollage, atterrissage, perte de signal |
| `ArrivalsService` | arrivées par aéroport (fichiers statiques, mis en cache) |
| `AuthService` | inscription, connexion, déconnexion, mot de passe oublié |

`AlertsService` ne déclenche rien en mode instantané : les données ne changent pas.

## Firestore

```
users/{autoId}        { uid, email, username }                 créé à l'inscription
preferences/{uid}     { favoriteAirport, favoriteFlights[],    une fiche par utilisateur
                        followed[{ icao24, callsign }],
                        notifications }
```

Les préférences sont **toujours** écrites dans `localStorage` (clé
`cloudtrack.preferences`), puis recopiées dans Firestore quand un utilisateur est
connecté. À la connexion, la version Firestore remplace la version locale.
`firestore.rules` limite chaque utilisateur à ses propres documents.

## Arborescence

```
src/app/
  aircraft.ts, airports.ts      modèles et données de référence
  *.service.ts                  logique et accès aux données
  plane-layer.ts, map-utils.ts  rendu Leaflet
  dashboard/                    carte, filtres, détail, tableau des arrivées
  topbar/                       navigation, recherche, état du flux
  card/                         ligne du tableau des arrivées (tr[app-card])
  bar-chart/                    diagramme en barres réutilisable
  airport-page/, airports-page/, stats/, profile-page/
  login/, register/, forgot-password/, verification-email/, map-backdrop/
functions/                      Cloud Function `opensky`
firestore.rules                 règles de sécurité
proxy.conf.json                 proxy OpenSky du serveur de dev
```

## Limites connues

- Les arrivées n'existent que pour CDG et ORY (fichiers statiques).
- Les alertes ne fonctionnent que tant qu'une page est ouverte (pas de notifications push).
- La conversion des numéros de vol IATA (AF1510) en indicatifs OACI (AFR1510) couvre une
  quarantaine de compagnies (`AIRLINE_ICAO` dans `topbar.component.ts`).
- `api.service.ts` et `models*.ts` sont hérités de la première version et ne sont plus
  utilisés par les écrans.
