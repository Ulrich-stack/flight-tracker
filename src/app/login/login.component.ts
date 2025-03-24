import { Component, inject, OnInit } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { AuthService } from '../auth.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent implements OnInit {
  constructor(
    private authService: AuthService,
    private formBuilder: FormBuilder
  ) {}

  loginForm!: FormGroup;
  ngOnInit(): void {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  onSubmit(): void {
    console.log(this.loginForm.value);

    this.authService.logIn(
      this.loginForm.value.email || '',
      this.loginForm.value.password || ''
    );
    this.loginForm.reset();
  }
}
