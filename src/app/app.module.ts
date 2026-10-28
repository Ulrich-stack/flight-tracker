import { LOCALE_ID, NgModule } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { HttpClientModule } from '@angular/common/http';
import { ApiService } from './api.service';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { ReactiveFormsModule } from '@angular/forms';
import { DashboardComponent } from './dashboard/dashboard.component';
import { firebaseConfig } from '../env/env';
import { CardComponent } from './card/card.component';
import { ProfileModalComponent } from './profile-modal/profile-modal.component';
import { VerificationEmailComponent } from './verification-email/verification-email.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { MapBackdropComponent } from './map-backdrop/map-backdrop.component';
import { TopbarComponent } from './topbar/topbar.component';
import { BarChartComponent } from './bar-chart/bar-chart.component';
import { StatsComponent } from './stats/stats.component';
import { AirportsPageComponent } from './airports-page/airports-page.component';
import { AirportPageComponent } from './airport-page/airport-page.component';
import { ProfilePageComponent } from './profile-page/profile-page.component';

registerLocaleData(localeFr);

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    DashboardComponent,
    CardComponent,
    ProfileModalComponent,
    VerificationEmailComponent,
    ForgotPasswordComponent,
    MapBackdropComponent,
    TopbarComponent,
    BarChartComponent,
    StatsComponent,
    AirportsPageComponent,
    AirportPageComponent,
    ProfilePageComponent,
  ],
  imports: [
    FormsModule,
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
  ],
  providers: [ApiService, { provide: LOCALE_ID, useValue: 'fr' }],
  bootstrap: [AppComponent],
})
export class AppModule {}
