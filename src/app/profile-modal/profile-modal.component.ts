import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-profile-modal',
  templateUrl: './profile-modal.component.html',
  styleUrls: ['./profile-modal.component.css']
})
export class ProfileModalComponent {
  @Input() isOpen: boolean = false;
  @Output() closeModal = new EventEmitter<void>();

  close() {
    this.closeModal.emit(); // Notifie le parent de fermer le modal
  }
}
