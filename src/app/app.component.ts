import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { AlertsService } from './alerts.service';

// Pages sans barre de navigation (authentification).
const AUTH_ROUTES = ['/login', '/signin', '/forgot-password', '/verification-email'];

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'flight-tracker';
  showChrome = false;

  constructor(router: Router, readonly alerts: AlertsService) {
    router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((e) => {
        const path = e.urlAfterRedirects.split(/[?#]/)[0];
        this.showChrome = !AUTH_ROUTES.includes(path);
      });
  }
}
