import { NgModule } from '@angular/core';
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
import { CardComponent } from './components/card/card.component';
import { ProfileModalComponent } from './profile-modal/profile-modal.component';
import { VerificationEmailComponent } from './verification-email/verification-email.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { FlightSidebarComponent } from './components/flight-sidebar/flight-sidebar.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { FlightFiltersComponent } from './components/flight-filters/flight-filters.component';
import { StatsPageComponent } from './stats-page/stats-page.component';
import { NgChartsModule } from 'ng2-charts';
import { ProfilePageComponent } from './profile-page/profile-page.component';


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
    FlightSidebarComponent,
    FlightFiltersComponent,
    StatsPageComponent,
    ProfilePageComponent,
  ],
  imports: [
    FormsModule,
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    NgSelectModule,
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    NgChartsModule,
  ],
  providers: [ApiService],
  bootstrap: [AppComponent],
})
export class AppModule {}
