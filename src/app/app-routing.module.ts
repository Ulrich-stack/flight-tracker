import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RegisterComponent } from './register/register.component';
import { LoginComponent } from './login/login.component';
import {
  redirectUnauthorizedTo,
  redirectLoggedInTo,
  canActivate,
} from '@angular/fire/auth-guard';
import { AppComponent } from './app.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { VerificationEmailComponent } from './verification-email/verification-email.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { StatsPageComponent } from './stats-page/stats-page.component';
import { ProfilePageComponent } from './profile-page/profile-page.component';

const redirectUnauthorizedToLogin = () => redirectUnauthorizedTo(['login']);
const redirectLoggedInToDashboard = () => redirectLoggedInTo(['']);

const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
    ...canActivate(redirectLoggedInToDashboard),
  },
  {
    path: 'signin',
    component: RegisterComponent,
    ...canActivate(redirectLoggedInToDashboard),
  },
  { path: 'verification-email', component: VerificationEmailComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },

  // Redirection par défaut : si aucune route n'est spécifiée, on redirige vers le dashboard.
  {
    path: '',
    component: DashboardComponent,
    ...canActivate(redirectUnauthorizedToLogin),
  },
  // Route wildcard pour rediriger toutes les routes non définies
  { path: 'statistiques', component: StatsPageComponent },
  { path: 'profile', component: ProfilePageComponent }


];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
