import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { UserData } from '../models';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile-page',
  templateUrl: './profile-page.component.html',
  styleUrls: ['./profile-page.component.css']
})
export class ProfilePageComponent implements OnInit {
  userData: UserData | null = null;
  editMode = false;
  updatedUsername: string = '';
  userId: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.authService.userData$.subscribe((user) => {
      if (user) {
        this.userData = user;
        this.updatedUsername = user.username;
        this.userId = user.uid;
      }
    });
  }

  enableEdit() {
    this.editMode = true;
  }

  cancelEdit() {
    this.editMode = false;
    this.updatedUsername = this.userData?.username || '';
  }

  saveChanges() {
    const trimmed = this.updatedUsername.trim();
    if (!this.userId || !trimmed) return;
  
    this.authService.updateUserPreferences(this.userId, {
      username: trimmed
    });
  
    if (this.userData) {
      this.userData.username = trimmed;
    }
  
    this.editMode = false;
  }

  goToStats() {
    this.router.navigate(['/statistiques']);
  }

  logOut() {
    this.authService.logOut();
  }
}
