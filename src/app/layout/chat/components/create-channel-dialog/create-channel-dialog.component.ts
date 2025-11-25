import { Component, EventEmitter, Input, Output, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';

export interface DialogUser {
  id: string;
  fullName: string;
  email: string;
  initials: string;
  avatarColor?: string;
}

@Component({
  selector: 'app-create-channel-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatButtonModule, MatChipsModule],
  templateUrl: './create-channel-dialog.component.html',
  styleUrls: ['./create-channel-dialog.component.scss']
})
export class CreateChannelDialogComponent implements OnInit, OnChanges {
  @Input() allUsers: DialogUser[] = [];
  @Input() open: boolean = false;

  @Output() close = new EventEmitter<void>();
  @Output() create = new EventEmitter<{ name: string; description: string; memberIds: string[] }>();

  channelName = '';
  description = '';
  searchQuery = '';
  selectedUsers: DialogUser[] = [];
  filteredUsers: DialogUser[] = [];

  ngOnInit(): void {
    this.filterUsers();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['allUsers'] || changes['open']) {
      this.filterUsers();
      if (changes['open'] && !changes['open'].currentValue) {
        // Reset form when dialog closes
        this.resetForm();
      }
    }
  }

  filterUsers(): void {
    const q = this.searchQuery.toLowerCase();
    this.filteredUsers = this.allUsers
      .filter(u => !this.selectedUsers.some(su => su.id === u.id))
      .filter(u => u.fullName.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
  }

  toggleUser(user: DialogUser): void {
    const index = this.selectedUsers.findIndex(u => u.id === user.id);
    if (index > -1) {
      this.selectedUsers.splice(index, 1);
    } else {
      this.selectedUsers.push(user);
    }
    this.filterUsers();
  }

  isUserSelected(user: DialogUser): boolean {
    return this.selectedUsers.some(u => u.id === user.id);
  }

  removeUser(user: DialogUser): void {
    this.selectedUsers = this.selectedUsers.filter(u => u.id !== user.id);
    this.filterUsers();
  }

  createChannel(): void {
    if (!this.channelName.trim()) {
      return;
    }

    this.create.emit({
      name: this.channelName.trim(),
      description: this.description.trim(),
      memberIds: this.selectedUsers.map(u => u.id)
    });
    this.resetForm();
  }

  closeDialog(): void {
    this.resetForm();
    this.close.emit();
  }

  resetForm(): void {
    this.channelName = '';
    this.description = '';
    this.searchQuery = '';
    this.selectedUsers = [];
    this.filterUsers();
  }

  canCreate(): boolean {
    return this.channelName.trim().length > 0;
  }
}

