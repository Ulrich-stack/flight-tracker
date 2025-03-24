import { inject, Inject, Injectable } from '@angular/core';

import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
  User,
  sendPasswordResetEmail,
} from '@angular/fire/auth';

import { Router } from '@angular/router';
import { BehaviorSubject, from, Observable } from 'rxjs';
import { UserInterface } from './user.interface';
import {
  addDoc,
  collection,
  CollectionReference,
  doc,
  Firestore,
  getDoc,
  getDocs,
  query,
  where,
} from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private auth = inject(Auth);
  private firestore = inject(Firestore); // inject Cloud Firestor
  private userDataSubject = new BehaviorSubject<any>(null);
  // Observable que les autres composants peuvent écouter
  public userData$ = this.userDataSubject.asObservable();

  constructor(private router: Router) {}

  signIn(email: string, username: string, password: string) {
    createUserWithEmailAndPassword(this.auth, email, password)
      .then((userCredential) => {
        const user = {
          uid: userCredential.user.uid,
          email: email,
          username: username,
        };

        const usersRef = collection(this.firestore, 'users');

        return addDoc(usersRef, user).then(() => {
          console.log('User created', user);

          return this.sendEmailforVerification(userCredential.user);
        });
      })
      .then(() => {
        this.router.navigate(['/']);
      })
      .catch((error) => {
        console.error('Error details:', error.code, error.message);
        alert(`Something went wrong: ${error.message}`);
      });
  }

  logIn(email: string, password: string) {
    signInWithEmailAndPassword(this.auth, email, password)
      .then(async (userCredential) => {
        const uid = userCredential.user.uid;
        console.log('User logged in', userCredential.user);
        const user = userCredential.user;
        const usersRef = collection(this.firestore, 'users');
        const q = query(usersRef, where('uid', '==', uid));

        this.router.navigate(['/']);

        const querySnapshot = await getDocs(q);

        //  Extraire les données
        const userData = querySnapshot.docs.map((doc) => ({
          ...doc.data(),
        }));

        console.log('User logged in', userData);
        if (userData.length > 0) {
          this.userDataSubject.next(userData[0]);
        } else {
          this.userDataSubject.next(null);
        }
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log('User not logged in');
        alert('User not logged in');
      });
  }

  logOut() {
    this.auth.signOut().then(() => {
      console.log('User logged out');
      this.router.navigate(['/login']);
    });
  }

  async sendEmailforVerification(user: User) {
    console.log('sendEmailVerification actif');

    try {
      await sendEmailVerification(user);
      alert('Email de vérification envoyé. Vérifie ta boîte mail.');
      this.router.navigate(['/verification-email']);
    } catch (err) {
      console.error("Erreur lors de l'envoi de l'email de vérification:", err);
      alert(
        "Une erreur est survenue lors de l'envoi de l'email de vérification."
      );
    }
  }
  // Forgot password
  async forgotPassword(email: string) {
    try {
      await sendPasswordResetEmail(this.auth, email);
      alert(
        'Un email de réinitialisation a été envoyé. Veuillez vérifier votre boîte mail.'
      );
      this.router.navigate(['verification-email']);
    } catch (err) {
      console.error('Erreur lors de la réinitialisation du mot de passe:', err);
      alert('Une erreur est survenue. Vérifiez votre email et réessayez.');
    }
  }
}
