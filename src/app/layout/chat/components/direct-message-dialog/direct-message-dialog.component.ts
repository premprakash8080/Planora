import { Component, EventEmitter, Input, Output, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

export interface DialogUser {
  id: string;
  fullName: string;
  email: string;
  initials: string;
  avatarColor?: string;
}

@Component({
  selector: 'app-direct-message-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatButtonModule],
  templateUrl: './direct-message-dialog.component.html',
  styleUrls: ['./direct-message-dialog.component.scss']
})
export class DirectMessageDialogComponent implements OnInit, OnChanges {
  @Input() allUsers: DialogUser[] = [];
  @Input() open: boolean = false;

  @Output() close = new EventEmitter<void>();
  @Output() selectUser = new EventEmitter<DialogUser>();

  searchQuery = '';
  filteredUsers: DialogUser[] = [];

  ngOnInit(): void {
    this.filterUsers();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['allUsers'] || changes['open']) {
      this.filterUsers();
      if (changes['open'] && !changes['open'].currentValue) {
        // Reset search when dialog closes
        this.searchQuery = '';
        this.filterUsers();
      }
    }
  }

  filterUsers(): void {
    const q = this.searchQuery.toLowerCase();
    if (!q) {
      // Show all users when search is empty
      this.filteredUsers = this.allUsers;
    } else {
      this.filteredUsers = this.allUsers.filter(
        u => u.fullName.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
      );
    }
  }

  onUserSelect(user: DialogUser): void {
    this.selectUser.emit(user);
    this.closeDialog();
  }

  closeDialog(): void {
    this.searchQuery = '';
    this.filterUsers();
    this.close.emit();
  }
}

