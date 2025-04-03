import { inject, Injectable } from '@angular/core';
import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  User,
  sendPasswordResetEmail,
  onAuthStateChanged,
} from '@angular/fire/auth';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import {
  collection,
  doc,
  Firestore,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
} from '@angular/fire/firestore';
import { UserData } from './models';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private auth = inject(Auth);
  private firestore = inject(Firestore);
  private userDataSubject = new BehaviorSubject<UserData | null>(null);
  public userData$ = this.userDataSubject.asObservable();

  constructor(private router: Router) {}

  // Recharge les données utilisateur à l'ouverture de l'app
  loadUserDataOnAppStart() {
    onAuthStateChanged(this.auth, async (user) => {
      if (user) {
        const q = query(
          collection(this.firestore, 'users'),
          where('uid', '==', user.uid)
        );
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
          const userData = snapshot.docs[0].data() as UserData;
          this.userDataSubject.next(userData);
          console.log('userData rechargé automatiquement :', userData);
        }
      } else {
        this.userDataSubject.next(null);
        console.log('Aucun utilisateur connecté.');
      }
    });
  }

  signIn(email: string, username: string, password: string) {
    createUserWithEmailAndPassword(this.auth, email, password)
      .then((userCredential) => {
        const newUser: UserData = {
          uid: userCredential.user.uid,
          email,
          username,
          favoriteAirport: {
            name: 'Paris Charles de Gaulle',
            code: 'LFPG',
          },
          favoriteCountries: [],
          favoriteFlights: [],
        };

        const userDoc = doc(this.firestore, 'users', newUser.uid);

        return setDoc(userDoc, newUser).then(() => {
          console.log('Utilisateur créé avec préférences par défaut', newUser);

          this.sendEmailforVerification(userCredential.user);
        });
      })
      .then(() => {
        this.router.navigate(['/']);
      })
      .catch((error) => {
        console.error('Erreur:', error.code, error.message);
        alert(`Something went wrong: ${error.message}`);
      });
  }

  logIn(email: string, password: string) {
    signInWithEmailAndPassword(this.auth, email, password)
      .then(async (userCredential) => {
        const uid = userCredential.user.uid;
        const q = query(
          collection(this.firestore, 'users'),
          where('uid', '==', uid)
        );
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
          const userData = snapshot.docs[0].data() as UserData;
          this.userDataSubject.next(userData);
          console.log('Connexion réussie', userData);
        } else {
          this.userDataSubject.next(null);
        }

        this.router.navigate(['/']);
      })
      .catch((error) => {
        console.error('Connexion échouée:', error);
        alert('User not logged in');
      });
  }

  logOut() {
    this.auth.signOut().then(() => {
      this.userDataSubject.next(null);
      console.log('Déconnexion réussie');
      this.router.navigate(['/login']);
    });
  }

  updateUserPreferences(uid: string, preferences: Partial<UserData>) {
    const userDocRef = doc(this.firestore, 'users', uid);
  
    return updateDoc(userDocRef, preferences)
      .then(async () => {
        console.log('Préférences mises à jour');
  
        // Recharge les données utilisateur à jour
        const updatedDoc = await getDoc(userDocRef);
        const newUserData = updatedDoc.data() as UserData;
        this.userDataSubject.next(newUserData);
      })
      .catch((err) => {
        console.error('Erreur lors de la mise à jour des préférences:', err);
        alert('Impossible de mettre à jour les préférences.');
      });
  }
  
  
  toggleFlightFavorite(
    uid: string,
    flightIcao: string,
    currentFavorites: string[] = []
  ) {
    const userDocRef = doc(this.firestore, 'users', uid);
    const updatedFavorites = currentFavorites.includes(flightIcao)
      ? currentFavorites.filter((f) => f !== flightIcao)
      : [...currentFavorites, flightIcao];

    try {
      updateDoc(userDocRef, {
        favoriteFlights: updatedFavorites,
      });
      console.log('Vol mis à jour dans les favoris');
      return updatedFavorites;
    } catch (err) {
      console.error('Erreur de mise à jour favoris', err);
      return currentFavorites;
    }
  }

  async sendEmailforVerification(user: User) {
    try {
      await sendEmailVerification(user);
      this.router.navigate(['/verification-email']);
    } catch (err) {
      console.error("Erreur d'envoi de l'email de vérification:", err);
      alert("Erreur lors de l'envoi de l'email de vérification.");
    }
  }

  async forgotPassword(email: string) {
    try {
      await sendPasswordResetEmail(this.auth, email);
      alert('Email de réinitialisation envoyé.');
      this.router.navigate(['verification-email']);
    } catch (err) {
      console.error('Erreur de mot de passe oublié:', err);
      alert('Erreur lors de la réinitialisation du mot de passe.');
    }
  }
}
