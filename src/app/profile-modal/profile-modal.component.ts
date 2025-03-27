import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-profile-modal',
  templateUrl: './profile-modal.component.html',
  styleUrls: ['./profile-modal.component.css']
})
export class ProfileModalComponent {
  @Input() isOpen: boolean = false;
  @Output() closeModal = new EventEmitter<void>();

  constructor(private authService: AuthService) {}

  close() {
    this.authService.logOut();  // Déconnecte l'utilisateur
    this.closeModal.emit(); // Notifie le parent de fermer le modal
  }
}
