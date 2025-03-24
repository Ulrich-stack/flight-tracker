import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent implements OnInit {
  router: any;

  constructor(private auth: AuthService, private fb: FormBuilder){}
  signinForm!: FormGroup;

  ngOnInit(): void {
    this.signinForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      name: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(){
    if(this.signinForm.valid){
      this.auth.signIn(this.signinForm.value.email, this.signinForm.value.name, this.signinForm.value.password);
      this.signinForm.reset();
      console.log();
      
    }
  }
}
