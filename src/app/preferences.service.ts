import { Injectable, inject } from '@angular/core';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';
import { Firestore, doc, getDoc, setDoc } from '@angular/fire/firestore';
import { BehaviorSubject } from 'rxjs';

export interface FollowedAircraft {
  icao24: string;
  callsign: string;
}

export interface Preferences {
  /** Code IATA de l'aéroport dont on affiche les arrivées. */
  favoriteAirport: string;
  /** Vols mis en favori dans les tableaux d'arrivées (numéro IATA, ex. AF1067). */
  favoriteFlights: string[];
  /** Avions suivis sur la carte : alertes au décollage et à l'atterrissage. */
  followed: FollowedAircraft[];
  notifications: boolean;
}

const DEFAULTS: Preferences = {
  favoriteAirport: 'CDG',
  favoriteFlights: [],
  followed: [],
  notifications: false,
};
const STORAGE_KEY = 'cloudtrack.preferences';

/**
 * Préférences de l'utilisateur. Toujours gardées dans le navigateur ; recopiées
 * dans Firestore (preferences/{uid}) quand un utilisateur est connecté.
 */
@Injectable({ providedIn: 'root' })
export class PreferencesService {
  private auth = inject(Auth);
  private firestore = inject(Firestore);
  private uid: string | null = null;

  readonly prefs$ = new BehaviorSubject<Preferences>(this.readLocal());

  constructor() {
    onAuthStateChanged(this.auth, async (user) => {
      this.uid = user?.uid ?? null;
      if (!this.uid) {
        return;
      }
      try {
        const snap = await getDoc(doc(this.firestore, 'preferences', this.uid));
        if (snap.exists()) {
          this.apply({ ...DEFAULTS, ...(snap.data() as Partial<Preferences>) }, false);
        } else {
          await this.saveRemote(this.prefs$.value);
        }
      } catch (err) {
        console.warn('Préférences Firestore indisponibles :', err);
      }
    });
  }

  get value(): Preferences {
    return this.prefs$.value;
  }

  setFavoriteAirport(iata: string): void {
    this.update({ favoriteAirport: iata });
  }

  isFavoriteFlight(code: string): boolean {
    return this.value.favoriteFlights.includes(code);
  }

  toggleFavoriteFlight(code: string): void {
    const list = this.value.favoriteFlights;
    this.update({
      favoriteFlights: list.includes(code) ? list.filter((c) => c !== code) : [...list, code],
    });
  }

  isFollowed(icao24: string): boolean {
    return this.value.followed.some((f) => f.icao24 === icao24);
  }

  toggleFollow(icao24: string, callsign: string): void {
    const list = this.value.followed;
    this.update({
      followed: this.isFollowed(icao24)
        ? list.filter((f) => f.icao24 !== icao24)
        : [...list, { icao24, callsign }],
    });
  }

  async setNotifications(enabled: boolean): Promise<boolean> {
    if (enabled && 'Notification' in window && Notification.permission !== 'granted') {
      enabled = (await Notification.requestPermission()) === 'granted';
    }
    this.update({ notifications: enabled });
    return enabled;
  }

  private update(patch: Partial<Preferences>): void {
    this.apply({ ...this.value, ...patch }, true);
  }

  private apply(prefs: Preferences, syncRemote: boolean): void {
    this.prefs$.next(prefs);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    } catch {
      // stockage indisponible (navigation privée) : on garde l'état en mémoire
    }
    if (syncRemote) {
      this.saveRemote(prefs).catch((err) => console.warn('Sauvegarde Firestore impossible :', err));
    }
  }

  private async saveRemote(prefs: Preferences): Promise<void> {
    if (this.uid) {
      await setDoc(doc(this.firestore, 'preferences', this.uid), prefs);
    }
  }

  private readLocal(): Preferences {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : { ...DEFAULTS };
    } catch {
      return { ...DEFAULTS };
    }
  }
}
