import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'], // Correction ici
})
export class RegisterComponent implements OnInit {
  signinForm!: FormGroup;

  constructor(private auth: AuthService, private fb: FormBuilder) {}

  ngOnInit(): void {
    this.signinForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      nom: ['', Validators.required],
      prenom: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  onSubmit() {
    if (this.signinForm.valid) {
      this.auth.signIn(
        this.signinForm.value.email,
        this.signinForm.value.nom + " " + this.signinForm.value.prenom,
        this.signinForm.value.password
      );
      console.log('submit ', this.signinForm.value);
      this.signinForm.reset();
      console.log();
      
    }
  }
}
