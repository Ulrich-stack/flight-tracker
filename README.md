# CLOUDtrack

Suivi des vols en temps réel : carte des avions (données OpenSky Network), recherche,
détail et trajectoire d'un vol, alertes, arrivées par aéroport et statistiques.
Angular 17, Leaflet, Firebase (Auth, Firestore, Hosting, Cloud Functions).

## Documentation

- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) : flux de données, proxy OpenSky, rendu de
  la carte, services, Firestore.
- [DESIGN.md](DESIGN.md) : couleurs, typographie, composants et règles visuelles.

## Installation

```bash
npm install
cp src/env/env.example.ts src/env/env.ts
```

Collez dans `src/env/env.ts` la config web du projet Firebase (console Firebase >
Paramètres du projet > Vos applications). Ce fichier n'est pas versionné.

## Développement

```bash
npm start
```

Ouvrez `http://localhost:4200/`. `npm start` lance `ng serve` avec `proxy.conf.json`,
qui relaie `/opensky/**` vers l'API OpenSky (elle refuse les appels directs depuis un
navigateur).

## Données OpenSky

- Sans compte : ~400 crédits par jour et une requête mondiale en coûte 4. L'app
  actualise donc toutes les 60 s, en pause quand l'onglet est caché, et bascule sur
  l'instantané `src/assets/flightsOpenSky.json` si OpenSky est injoignable ou si le
  quota est épuisé.
- Avec un compte gratuit (~4 000 crédits par jour) : créez un « API client » sur
  opensky-network.org puis renseignez `functions/.env` à partir de `functions/.env.example`.

## Sources et attributions

| Source | Usage | Conditions |
|---|---|---|
| [OpenSky Network](https://opensky-network.org) | positions et trajectoires des avions | usage non commercial ; citer OpenSky Network |
| [Esri](https://www.esri.com) (World Dark Gray Canvas) | fond de carte | attribution affichée sur la carte |
| [aviationstack](https://aviationstack.com) | arrivées CDG et ORY (exports dans `src/assets/`) | données d'exemple, non actualisées |
| [Leaflet](https://leafletjs.com) | bibliothèque de carte | licence BSD-2 |

Les attributions Esri et OpenSky sont affichées dans l'application (carte et pages de
connexion). Un usage commercial demande l'accord d'OpenSky.

## Déploiement Firebase

Le projet doit être sur la formule **Blaze** (paiement à l'usage) pour déployer la
Cloud Function.

```bash
cd functions && npm install && cd ..
npx firebase-tools login
npx firebase-tools deploy
```

Le déploiement :

- construit l'app (`npm run build`) et la publie sur Hosting (`dist/flight-tracker/browser`) ;
- déploie la fonction `opensky` (europe-west1), vers laquelle Hosting redirige `/opensky/**`.
  Le CDN met ses réponses en cache 30 s, ce qui partage une requête entre tous les visiteurs ;
- publie les règles `firestore.rules` : chaque utilisateur ne lit et n'écrit que son
  profil (`users`) et ses préférences (`preferences/{uid}`).

## Tests

```bash
npm test
```
