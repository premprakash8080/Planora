// add-members-dialog.component.ts
import { Component, EventEmitter, Input, Output, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface User {
  id: string;
  fullName: string;
  email: string;
  initials: string;
  avatarColor?: string;
}

@Component({
  selector: 'app-add-members-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-members-dialog.component.html',
  styleUrls: ['./add-members-dialog.component.scss']
})
export class AddMembersDialogComponent implements OnInit, OnChanges {
  @Input() allUsers: User[] = [];
  @Input() currentMembers: string[] = [];
  @Output() close = new EventEmitter<void>();        // Output event
  @Output() add = new EventEmitter<User[]>();

  searchQuery = '';
  selectedUsers: User[] = [];
  filteredUsers: User[] = [];

  ngOnInit(): void {
    this.filterUsers();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Re-filter when inputs change
    if (changes['allUsers'] || changes['currentMembers']) {
      this.filterUsers();
      // Also clear selected users if currentMembers changed (to avoid selecting already added members)
      if (changes['currentMembers'] && !changes['currentMembers'].firstChange) {
        this.selectedUsers = this.selectedUsers.filter(
          user => !this.currentMembers.includes(user.id)
        );
      }
    }
  }

  filterUsers(): void {
    const q = this.searchQuery.toLowerCase();
    this.filteredUsers = this.allUsers
      .filter(u => !this.currentMembers.includes(u.id))
      .filter(u => u.fullName.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
  }

  toggleUser(user: User): void {
    const i = this.selectedUsers.findIndex(u => u.id === user.id);
    if (i > -1) {
      this.selectedUsers.splice(i, 1);
    } else {
      this.selectedUsers.push(user);
    }
  }

  isUserSelected(user: User): boolean {
    return this.selectedUsers.some(u => u.id === user.id);
  }

  removeUser(user: User): void {
    this.selectedUsers = this.selectedUsers.filter(u => u.id !== user.id);
  }

  addMembers(): void {
    if (this.selectedUsers.length > 0) {
      this.add.emit(this.selectedUsers);
      this.closeDialog(); // close after adding
    }
  }

  closeDialog(): void {
    // Reset state when closing
    this.searchQuery = '';
    this.selectedUsers = [];
    this.filterUsers();
    this.close.emit();
  }
}