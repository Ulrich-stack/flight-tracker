/**
 * Relais OpenSky.
 *
 * L'API OpenSky refuse les appels venant directement d'un navigateur (CORS) :
 * Firebase Hosting redirige /opensky/** vers cette fonction, qui interroge OpenSky
 * côté serveur. Les réponses sont mises en cache par le CDN de Hosting, ce qui
 * partage une même requête entre tous les visiteurs et ménage le quota.
 *
 * Identifiants OpenSky facultatifs (compte gratuit : ~4 000 crédits/jour au lieu
 * de ~400) : OPENSKY_CLIENT_ID et OPENSKY_CLIENT_SECRET dans functions/.env.
 */
const { onRequest } = require('firebase-functions/v2/https');
const logger = require('firebase-functions/logger');

const API = 'https://opensky-network.org/api';
const TOKEN_URL =
  'https://auth.opensky-network.org/auth/realms/opensky-network/protocol/openid-connect/token';

// Routes relayées, avec leur durée de cache CDN (s) et les paramètres autorisés.
const ROUTES = {
  '/states/all': { sMaxAge: 30, params: ['lamin', 'lomin', 'lamax', 'lomax', 'icao24', 'time', 'extended'] },
  '/tracks/all': { sMaxAge: 60, params: ['icao24', 'time'] },
};

let token = null; // { value, expiresAt }

async function accessToken() {
  const id = process.env.OPENSKY_CLIENT_ID;
  const secret = process.env.OPENSKY_CLIENT_SECRET;
  if (!id || !secret) {
    return null; // accès anonyme
  }
  if (token && token.expiresAt > Date.now() + 30_000) {
    return token.value;
  }
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'client_credentials', client_id: id, client_secret: secret }),
  });
  if (!res.ok) {
    throw new Error(`Jeton OpenSky refusé (${res.status})`);
  }
  const json = await res.json();
  token = { value: json.access_token, expiresAt: Date.now() + json.expires_in * 1000 };
  return token.value;
}

exports.opensky = onRequest(
  { region: 'europe-west1', memory: '256MiB', timeoutSeconds: 30, maxInstances: 5 },
  async (req, res) => {
    if (req.method !== 'GET') {
      res.status(405).send('Méthode non autorisée');
      return;
    }

    const path = req.path.replace(/^\/opensky/, '');
    const route = ROUTES[path];
    if (!route) {
      res.status(404).send('Route inconnue');
      return;
    }

    const query = new URLSearchParams();
    for (const key of route.params) {
      if (typeof req.query[key] === 'string') {
        query.set(key, req.query[key]);
      }
    }

    try {
      const headers = {};
      const bearer = await accessToken();
      if (bearer) {
        headers.Authorization = `Bearer ${bearer}`;
      }
      const qs = query.toString();
      const upstream = await fetch(`${API}${path}${qs ? `?${qs}` : ''}`, { headers });

      res.status(upstream.status);
      res.set('Content-Type', upstream.headers.get('content-type') ?? 'application/json');
      res.set(
        'Cache-Control',
        upstream.ok ? `public, max-age=${Math.floor(route.sMaxAge / 2)}, s-maxage=${route.sMaxAge}` : 'no-store'
      );
      res.send(await upstream.text());
    } catch (err) {
      logger.error('Relais OpenSky en échec', err);
      res.status(502).set('Cache-Control', 'no-store').json({ error: 'OpenSky injoignable' });
    }
  }
);
