import { Component, Input, Output, EventEmitter, ViewChild, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { SharedUiModule } from '../../../../shared/ui/ui.module';
import { AppAsideComponent } from '../../../../shared/ui/app-aside/app-aside.component';

/**
 * User interface matching API response
 */
export interface ChannelDetailsUser {
  id: string;
  fullName: string;
  email: string;
  avatarUrl: string | null;
  avatarColor: string;
  initials: string;
}

/**
 * Member interface with role and status
 */
export interface ChannelDetailsMember extends ChannelDetailsUser {
  role: 'owner' | 'admin' | 'member';
  lastReadAt: string;
  unreadCount: number;
  isMuted: boolean;
}

/**
 * Channel details interface matching API response
 */
export interface ChannelDetails {
  id: string;
  name: string;
  description: string | null;
  type: 'direct' | 'group' | 'public' | 'private';
  createdBy: ChannelDetailsUser;
  members: ChannelDetailsMember[];
  memberCount: number;
  myRole: 'owner' | 'admin' | 'member';
  myUnreadCount: number;
  myLastReadAt: string;
  isArchived: boolean;
  firestorePath: string;
  lastMessageAt: string;
}

@Component({
  selector: 'vex-channel-details',
  templateUrl: './channel-details.component.html',
  styleUrls: ['./channel-details.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatMenuModule,
    MatDividerModule,
    SharedUiModule,
    AppAsideComponent
  ]
})
export class ChannelDetailsComponent {
  @Input() channel: ChannelDetails | null = null;
  @Input() open: boolean = false;
  @Input() allUsers: Array<{ id: string; fullName: string; email: string; initials: string; avatarColor?: string }> = [];

  @Output() close = new EventEmitter<void>();
  @Output() channelNameChange = new EventEmitter<{ name: string }>();
  @Output() channelDescriptionChange = new EventEmitter<{ description: string }>();
  @Output() addMembers = new EventEmitter<void>();
  @Output() leaveChannel = new EventEmitter<void>();
  @Output() toggleMute = new EventEmitter<ChannelDetailsMember>();
  @Output() memberClick = new EventEmitter<ChannelDetailsMember>();
  @Output() removeMember = new EventEmitter<ChannelDetailsMember>();
  @Output() updateMemberRole = new EventEmitter<{ memberId: string; role: 'owner' | 'admin' | 'member' }>();

  // Inline editing state
  editingName = false;
  editingDescription = false;
  editedName = '';
  editedDescription = '';

  @ViewChild('nameInput', { static: false }) nameInput?: ElementRef<HTMLInputElement>;
  @ViewChild('descriptionTextarea', { static: false }) descriptionTextarea?: ElementRef<HTMLTextAreaElement>;

  /**
   * Check if edit button should be shown
   */
  canEdit(): boolean {
    if (!this.channel) return false;
    // Owners and admins can edit (except for direct chats)
    return (this.channel.myRole === 'owner' || this.channel.myRole === 'admin') && this.channel.type !== 'direct';
  }

  /**
   * Check if add members button should be shown
   * Only for group/public/private channels, not direct chats
   */
  canAddMembers(): boolean {
    if (!this.channel) return false;
    // Only group channels can have members added
    return this.channel.type !== 'direct' && (this.channel.myRole === 'owner' || this.channel.myRole === 'admin');
  }

  /**
   * Check if remove member is allowed
   */
  canRemoveMember(member: ChannelDetailsMember): boolean {
    if (!this.channel) return false;
    // Can't remove yourself
    if (this.isCurrentUser(member)) return false;
    // Only owners and admins can remove members
    if (this.channel.myRole !== 'owner' && this.channel.myRole !== 'admin') return false;
    // Can't remove owners (unless you're the owner)
    if (member.role === 'owner' && this.channel.myRole !== 'owner') return false;
    return true;
  }

  /**
   * Check if leave button should be shown
   * Hide for owner in direct chat
   */
  canLeave(): boolean {
    if (!this.channel) return false;
    // Can't leave direct chats
    if (this.channel.type === 'direct') {
      return false;
    }
    return true;
  }

  /**
   * Check if this is a direct chat
   */
  isDirectChat(): boolean {
    return this.channel?.type === 'direct' || false;
  }

  /**
   * Check if member is current user
   */
  isCurrentUser(member: ChannelDetailsMember): boolean {
    // This would need to be passed from parent or use a service
    // For now, we'll check by comparing with myRole
    return false; // Will be handled by parent component
  }

  /**
   * Get channel type display name
   */
  getChannelTypeLabel(): string {
    if (!this.channel) return '';
    switch (this.channel.type) {
      case 'direct':
        return 'Direct Message';
      case 'group':
        return 'Group Chat';
      case 'public':
        return 'Public Channel';
      case 'private':
        return 'Private Channel';
      default:
        return 'Channel';
    }
  }

  /**
   * Get avatar initials or fallback
   */
  getAvatarInitials(user: ChannelDetailsUser | ChannelDetailsMember): string {
    return user.initials || user.fullName.charAt(0).toUpperCase();
  }

  /**
   * Get avatar background color
   */
  getAvatarColor(user: ChannelDetailsUser | ChannelDetailsMember): string {
    return user.avatarColor || '#3b82f6';
  }

  /**
   * Get role badge label
   */
  getRoleLabel(role: string): string {
    return role.charAt(0).toUpperCase() + role.slice(1);
  }

  /**
   * Get role badge color
   */
  getRoleBadgeColor(role: string): string {
    switch (role) {
      case 'owner':
        return '#8b5cf6'; // Purple
      case 'admin':
        return '#3b82f6'; // Blue
      case 'member':
        return '#6b7280'; // Gray
      default:
        return '#6b7280';
    }
  }

  /**
   * Handle role change
   */
  onRoleChange(member: ChannelDetailsMember, newRole: 'owner' | 'admin' | 'member'): void {
    if (member.role === newRole) return;
    this.updateMemberRole.emit({ memberId: member.id, role: newRole });
  }

  /**
   * Start editing channel name
   */
  startEditingName(): void {
    if (!this.channel || !this.canEdit()) return;
    this.editedName = this.channel.name;
    this.editingName = true;
    // Focus input after view update
    setTimeout(() => {
      this.nameInput?.nativeElement?.focus();
      this.nameInput?.nativeElement?.select();
    }, 0);
  }

  /**
   * Save channel name
   */
  saveName(): void {
    if (!this.channel || !this.editedName.trim()) {
      this.cancelEditingName();
      return;
    }
    if (this.editedName.trim() !== this.channel.name) {
      this.channelNameChange.emit({ name: this.editedName.trim() });
    }
    this.editingName = false;
  }

  /**
   * Cancel editing name
   */
  cancelEditingName(): void {
    this.editedName = this.channel?.name || '';
    this.editingName = false;
  }

  /**
   * Handle name input keydown
   */
  onNameKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.saveName();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      this.cancelEditingName();
    }
  }

  /**
   * Start editing description
   */
  startEditingDescription(): void {
    if (!this.channel || !this.canEdit()) return;
    this.editedDescription = this.channel.description || '';
    this.editingDescription = true;
    // Focus textarea after view update
    setTimeout(() => {
      this.descriptionTextarea?.nativeElement?.focus();
      // Move cursor to end
      const textarea = this.descriptionTextarea?.nativeElement;
      if (textarea) {
        textarea.setSelectionRange(textarea.value.length, textarea.value.length);
      }
    }, 0);
  }

  /**
   * Save description
   */
  saveDescription(): void {
    if (!this.channel) {
      this.cancelEditingDescription();
      return;
    }
    const newDescription = this.editedDescription.trim();
    if (newDescription !== (this.channel.description || '')) {
      this.channelDescriptionChange.emit({ description: newDescription });
    }
    this.editingDescription = false;
  }

  /**
   * Cancel editing description
   */
  cancelEditingDescription(): void {
    this.editedDescription = this.channel?.description || '';
    this.editingDescription = false;
  }

  /**
   * Handle description textarea keydown
   */
  onDescriptionKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      event.preventDefault();
      this.cancelEditingDescription();
    }
    // Allow Enter for multi-line, but Ctrl/Cmd+Enter to save
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
      event.preventDefault();
      this.saveDescription();
    }
  }

  /**
   * Click outside handler
   */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (this.editingName && !target.closest('.channel-details__name-editable')) {
      this.saveName();
    }
    if (this.editingDescription && !target.closest('.channel-details__description-editable')) {
      this.saveDescription();
    }
  }

  /**
   * Handle add members action
   */
  onAddMembers(): void {
    this.addMembers.emit();
  }

  /**
   * Handle leave channel action
   */
  onLeaveChannel(): void {
    this.leaveChannel.emit();
  }

  /**
   * Handle remove member action
   */
  onRemoveMember(member: ChannelDetailsMember, event: Event): void {
    event.stopPropagation();
    this.removeMember.emit(member);
  }

  /**
   * Handle toggle mute for a member
   */
  onToggleMute(member: ChannelDetailsMember): void {
    this.toggleMute.emit(member);
  }

  /**
   * Handle member click
   */
  onMemberClick(member: ChannelDetailsMember): void {
    this.memberClick.emit(member);
  }

  /**
   * Track by function for members list
   */
  trackByMemberId(index: number, member: ChannelDetailsMember): string {
    return member.id;
  }
}

