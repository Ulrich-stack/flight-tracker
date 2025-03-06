import { Component } from '@angular/core';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css',
})
export class ForgotPasswordComponent {
  email: string = '';

  constructor(private authService: AuthService) {}

  forgotPassword() {
    if (this.email) {
      this.authService.forgotPassword(this.email);
    } else {
      alert('Veuillez entrer votre email');
    }
  }
}
