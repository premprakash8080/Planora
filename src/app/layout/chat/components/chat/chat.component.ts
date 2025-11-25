import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Subject, combineLatest } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ChatSidebarComponent } from '../chat-sidebar/chat-sidebar.component';
import { Channel } from '../chat-channel-item/chat-channel-item.component';
import { ChatHeaderComponent, ChatHeaderUser, ChatHeaderMember } from '../chat-header/chat-header.component';
import { ChatMessagesComponent } from '../chat-messages/chat-messages.component';
import { ChatMessageInputComponent } from '../chat-message-input/chat-message-input.component';
import { AddMembersDialogComponent } from '../add-members-dialog/add-members-dialog.component';
import { CreateChannelDialogComponent } from '../create-channel-dialog/create-channel-dialog.component';
import { DirectMessageDialogComponent } from '../direct-message-dialog/direct-message-dialog.component';
import { ChannelDetailsComponent, ChannelDetails } from '../channel-details/channel-details.component';
import { SharedUiModule } from '../../../../shared/ui/ui.module';
import { ChatService, User as ApiUser } from '../../service/chat.service';
import { FirebaseService } from '../../service/firebase.service';
import { FirestoreChatService, ChatMessage } from '../../service/firestore-chat.service';
import { SnackBarService } from '../../../../shared/services/snackbar.service';
import { UserSessionService } from '../../../../shared/services/user-session.service';

// User interface for AddMembersDialogComponent
interface DialogUser {
  id: string;
  fullName: string;
  email: string;
  initials: string;
  avatarColor?: string;
}

@Component({
  selector: 'vex-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    ChatSidebarComponent,
    ChatHeaderComponent,
    ChatMessagesComponent,
    ChatMessageInputComponent,
    AddMembersDialogComponent,
    CreateChannelDialogComponent,
    DirectMessageDialogComponent,
    ChannelDetailsComponent,
    SharedUiModule
  ]
})
export class ChatComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Sidebar state
  sidebarCollapsed = false;
  channels: Channel[] = [];
  directMessages: Channel[] = [];
  selectedChannelId: string | null = null;

  // Current channel/message data
  currentChannel: Channel | null = null;
  currentChannelMembers: ChatHeaderMember[] = [];
  currentDirectMessageUser: ChatHeaderUser | undefined;
  messages: ChatMessage[] = [];
  messagesLoading = false;

  // Dialog state
  showAddMembersDialog = false;
  showCreateChannelDialog = false;
  showDirectMessageDialog = false;
  addMembersDialogMode: 'create-channel' | 'create-dm' | 'add-members' = 'create-channel';
  allUsers: DialogUser[] = [];
  currentMembers: string[] = [];

  // Channel details state
  showChannelDetails = false;
  channelDetails: ChannelDetails | null = null;
  channelDetailsLoading = false;

  constructor(
    private chatService: ChatService,
    private firebaseService: FirebaseService,
    private firestoreChatService: FirestoreChatService,
    private snackBarService: SnackBarService,
    private userSessionService: UserSessionService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Firebase Firestore is initialized automatically in FirebaseService constructor
    // No authentication needed - we use MySQL + JWT for auth
    if (this.firebaseService.isInitialized()) {
      console.log('✅ Firebase Firestore ready for real-time chat');
    } else {
      console.warn('⚠️ Firebase Firestore not initialized');
    }
    
    // Load channels and direct messages in parallel
    // This ensures data is available as soon as possible
    this.loadChannels();
    this.loadDirectMessages();
    this.loadAllUsers();
    
    // Force initial change detection
    this.cdr.markForCheck();
  }

  ngOnDestroy(): void {
    // Unsubscribe from all Firestore listeners
    this.firestoreChatService.clearAllSubscriptions();
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadChannels(): void {
    console.log('🔄 Loading channels...');
    this.chatService.getChannels('group', false)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (channels) => {
          console.log('✅ Loaded channels:', channels);
          console.log('   Count:', channels.length);
          this.channels = channels;
          this.cdr.markForCheck(); // Force change detection
          
          // If a channel is already selected but not found in currentChannel, try to set it up
          if (this.selectedChannelId && !this.currentChannel) {
            const foundChannel = channels.find(c => c.id === this.selectedChannelId);
            if (foundChannel) {
              console.log('🔄 Found selected channel in newly loaded channels, setting up...');
              this.currentChannel = foundChannel;
              this.setupChannelData(this.selectedChannelId, foundChannel);
            }
          }
        },
        error: (error) => {
          console.error('❌ Error loading channels:', error);
          this.snackBarService.showError(error || 'Failed to load channels');
          this.cdr.markForCheck();
        }
      });
  }

  loadDirectMessages(): void {
    console.log('🔄 Loading direct messages...');
    this.chatService.getDirectMessages()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (dms) => {
          console.log('✅ Loaded direct messages:', dms);
          console.log('   Count:', dms.length);
          this.directMessages = dms;
          this.cdr.markForCheck(); // Force change detection
          
          // If a channel is already selected but not found in currentChannel, try to set it up
          if (this.selectedChannelId && !this.currentChannel) {
            const foundChannel = dms.find(c => c.id === this.selectedChannelId);
            if (foundChannel) {
              console.log('🔄 Found selected channel in newly loaded DMs, setting up...');
              this.currentChannel = foundChannel;
              this.setupChannelData(this.selectedChannelId, foundChannel);
            }
          }
        },
        error: (error) => {
          console.error('❌ Error loading direct messages:', error);
          this.snackBarService.showError(error || 'Failed to load direct messages');
          this.cdr.markForCheck();
        }
      });
  }

  loadAllUsers(): void {
    this.chatService.getAllUsers()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (users: ApiUser[]) => {
          this.allUsers = users.map(user => ({
            id: user.id.toString(),
            fullName: user.full_name,
            email: user.email,
            initials: user.initials || (user.full_name ? user.full_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : '?'),
            avatarColor: user.avatar_color
          }));
        },
        error: (error) => {
          console.error('Failed to load users:', error);
        }
      });
  }

  onChannelSelected(channelId: string): void {
    // Prevent duplicate selection if already selected
    if (this.selectedChannelId === channelId) {
      return;
    }

    console.log('🔄 Selecting channel:', channelId);
    console.log('   Available channels:', this.channels.length);
    console.log('   Available DMs:', this.directMessages.length);
    
    // Clear previous messages immediately to show loading state
    this.messages = [];
    this.messagesLoading = true;
    
    // Unsubscribe from previous channel's messages if switching
    if (this.selectedChannelId) {
      this.firestoreChatService.unsubscribeFromMessages(this.selectedChannelId);
    }
    
    // Set selectedChannelId immediately for UI update
    this.selectedChannelId = channelId;
    this.cdr.markForCheck(); // Force change detection to show loading state
    
    // Find channel in both channels and directMessages arrays
    this.currentChannel = [...this.channels, ...this.directMessages].find(c => c.id === channelId) || null;
    
    if (!this.currentChannel) {
      console.warn('⚠️ Channel not found in local arrays, fetching from API...', channelId);
      console.log('   Current channels:', this.channels.length, 'Current DMs:', this.directMessages.length);
      
      // If channel not found locally, fetch it from API
      this.chatService.getChannelById(channelId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (channel) => {
            console.log('✅ Channel fetched from API:', channel);
            this.currentChannel = channel;
            
            // Add channel to appropriate array if not already there
            if (channel.type === 'direct') {
              const exists = this.directMessages.find(c => c.id === channelId);
              if (!exists) {
                this.directMessages.push(channel);
              }
            } else {
              const exists = this.channels.find(c => c.id === channelId);
              if (!exists) {
                this.channels.push(channel);
              }
            }
            
            this.setupChannelData(channelId, channel);
            this.cdr.markForCheck();
          },
          error: (error) => {
            console.error('❌ Failed to load channel:', error);
            this.snackBarService.showError('Failed to load channel');
            this.selectedChannelId = null;
            this.messagesLoading = false;
            this.cdr.markForCheck();
          }
        });
      return;
    }
    
    console.log('✅ Channel found in local arrays:', this.currentChannel);
    this.setupChannelData(channelId, this.currentChannel);
    this.cdr.markForCheck();
  }

  private setupChannelData(channelId: string, channel: Channel): void {
    console.log('🔧 Setting up channel data for:', channelId, channel);
    
    if (channel.type === 'direct') {
      this.currentDirectMessageUser = channel.otherUser ? {
        id: channel.otherUser.id,
        name: channel.otherUser.name,
        avatarColor: channel.otherUser.avatarColor,
        initials: channel.otherUser.initials,
        isOnline: channel.otherUser.isOnline
      } : undefined;
      this.currentChannelMembers = [];
    } else {
      // Load channel members for group channels
      this.loadChannelMembers(channelId);
    }
    
    // Force change detection after setting channel data
    this.cdr.markForCheck();
    
    // Load messages for this channel
    this.loadMessages(channelId);
    
    // Load channel details if panel is open
    if (this.showChannelDetails) {
      this.loadChannelDetails(channelId);
    }
  }

  /**
   * Load channel members for group channels
   */
  private loadChannelMembers(channelId: string): void {
    this.chatService.getChannelById(channelId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (channel) => {
          // Extract members from channel data
          // The backend returns members in the channel response
          // We need to map them to ChatHeaderMember format
          this.currentChannelMembers = [];
          // TODO: Map channel.members to ChatHeaderMember[] when backend provides full member data
        },
        error: (error) => {
          console.error('Failed to load channel members:', error);
        }
      });
  }

  loadMessages(channelId: string): void {
    // Ensure loading state is set
    this.messagesLoading = true;
    
    // Clear messages immediately when loading new channel
    // This ensures the UI shows loading state instead of previous channel's messages
    if (this.selectedChannelId === channelId) {
      this.messages = [];
    }

    // Use Firestore real-time listener if available (no auth required)
    if (this.firebaseService.isInitialized()) {
      console.log('📡 Loading messages via Firestore for channel:', channelId);
      this.firestoreChatService.getMessagesRealtime(channelId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (messages) => {
            console.log('✅ Received messages from Firestore:', messages.length);
            this.messages = messages;
            this.messagesLoading = false;
            this.cdr.markForCheck(); // Force change detection
            // Mark messages as read
            this.chatService.markMessagesAsRead(channelId).subscribe();
          },
          error: (error) => {
            console.error('❌ Error in real-time messages:', error);
            // Fallback to REST API
            this.loadMessagesViaAPI(channelId);
          }
        });
    } else {
      // Fallback to REST API if Firestore not initialized
      console.log('📡 Loading messages via REST API for channel:', channelId);
      this.loadMessagesViaAPI(channelId);
    }
  }

  /**
   * Load messages via REST API (fallback)
   */
  private loadMessagesViaAPI(channelId: string): void {
    this.chatService.getMessages(channelId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (messages) => {
          console.log('✅ Received messages from API:', messages.length);
          // Convert API messages to ChatMessage format
          // Backend returns: senderId, senderName, senderEmail, senderAvatar, etc.
          this.messages = messages.map((msg: any) => {
            const userId = parseInt(msg.senderId || msg.userId || '0');
            return {
              id: msg.id,
              content: msg.content,
              userId: userId,
              channelId: msg.channelId || channelId,
              createdAt: new Date(msg.createdAt),
              user: {
                id: userId,
                full_name: msg.senderName || msg.user?.full_name || 'Unknown User',
                email: msg.senderEmail || msg.user?.email || '',
                avatar_url: msg.senderAvatar || msg.user?.avatar_url || null,
                avatar_color: msg.senderAvatarColor || msg.user?.avatar_color || null,
                initials: msg.senderInitials || msg.user?.initials || null
              }
            };
          });
          this.messagesLoading = false;
          this.cdr.markForCheck(); // Force change detection
          // Mark messages as read
          this.chatService.markMessagesAsRead(channelId).subscribe();
        },
        error: (error) => {
          console.error('❌ Error loading messages via API:', error);
          this.snackBarService.showError(error || 'Failed to load messages');
          this.messagesLoading = false;
          // Ensure messages array is empty on error
          this.messages = [];
          this.cdr.markForCheck();
        }
      });
  }

  onToggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  onCreateChannel(): void {
    this.showCreateChannelDialog = true;
  }

  onCreateDirectMessage(): void {
    this.showDirectMessageDialog = true;
  }

  /**
   * Handle create channel from dialog
   */
  onCreateChannelSubmit(event: { name: string; description: string; memberIds: string[] }): void {
    // Convert string IDs to numbers
    const memberIds = event.memberIds.map(id => {
      const numId = parseInt(id, 10);
      if (isNaN(numId)) {
        console.error('Invalid user ID:', id);
        return null;
      }
      return numId;
    }).filter((id): id is number => id !== null);
    
    this.chatService.createChannel({
      name: event.name,
      description: event.description || undefined,
      type: 'group',
      memberIds: memberIds
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (channel) => {
          this.channels.push(channel);
          this.selectedChannelId = channel.id;
          this.onChannelSelected(channel.id);
          this.showCreateChannelDialog = false;
          this.snackBarService.showSuccess('Channel created successfully');
          this.cdr.markForCheck();
        },
        error: (error) => {
          this.snackBarService.showError(error || 'Failed to create channel');
        }
      });
  }

  /**
   * Handle direct message user selection
   */
  onDirectMessageUserSelect(user: DialogUser): void {
    const userId = parseInt(user.id, 10);
    if (isNaN(userId)) {
      this.snackBarService.showError('Invalid user ID');
      return;
    }
    
    this.chatService.startDirectMessage(userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (channel) => {
          // Check if DM already exists
          const existingIndex = this.directMessages.findIndex(dm => dm.id === channel.id);
          if (existingIndex >= 0) {
            this.directMessages[existingIndex] = channel;
          } else {
            this.directMessages.push(channel);
          }
          this.selectedChannelId = channel.id;
          this.onChannelSelected(channel.id);
          this.showDirectMessageDialog = false;
          this.snackBarService.showSuccess('Direct message started');
          this.cdr.markForCheck();
        },
        error: (error) => {
          this.snackBarService.showError(error || 'Failed to start direct message');
        }
      });
  }

  onAddMembersDialogClose(): void {
    this.showAddMembersDialog = false;
  }

  onAddMembersDialogAdd(users: DialogUser[]): void {
    if (this.addMembersDialogMode === 'create-channel') {
      this.createChannelWithMembers(users);
    } else if (this.addMembersDialogMode === 'create-dm') {
      this.createDirectMessage(users);
    } else if (this.addMembersDialogMode === 'add-members' && this.selectedChannelId) {
      this.addMembersToChannel(users);
    }
  }

  private createChannelWithMembers(users: any[]): void {
    if (users.length === 0) {
      this.snackBarService.showError('Please select at least one member');
      return;
    }

    // For now, use first user's name as channel name suggestion
    // In production, you'd have a dialog to enter channel name
    const channelName = `Channel with ${users.map(u => u.fullName).join(', ')}`;
    
    this.chatService.createChannel({
      name: channelName,
      type: 'group',
      memberIds: users.map(u => parseInt(u.id))
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (channel) => {
          this.channels.push(channel);
          this.selectedChannelId = channel.id;
          this.onChannelSelected(channel.id);
          this.showAddMembersDialog = false;
          this.snackBarService.showSuccess('Channel created successfully');
        },
        error: (error) => {
          this.snackBarService.showError(error || 'Failed to create channel');
        }
      });
  }

  private createDirectMessage(users: DialogUser[]): void {
    if (users.length !== 1) {
      this.snackBarService.showError('Please select exactly one user for direct message');
      return;
    }

    const userId = parseInt(users[0].id);
    this.chatService.startDirectMessage(userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (channel) => {
          // Check if DM already exists
          const existingIndex = this.directMessages.findIndex(dm => dm.id === channel.id);
          if (existingIndex >= 0) {
            this.directMessages[existingIndex] = channel;
          } else {
            this.directMessages.push(channel);
          }
          this.selectedChannelId = channel.id;
          this.onChannelSelected(channel.id);
          this.showAddMembersDialog = false;
          this.snackBarService.showSuccess('Direct message started');
        },
        error: (error) => {
          this.snackBarService.showError(error || 'Failed to start direct message');
        }
      });
  }

  private addMembersToChannel(users: DialogUser[]): void {
    if (!this.selectedChannelId || users.length === 0) {
      return;
    }

    const userIds = users.map(u => parseInt(u.id));
    
    // Add members one by one (backend accepts single userId per request)
    let completed = 0;
    let errors = 0;
    const total = userIds.length;
    
    userIds.forEach(userId => {
      this.chatService.addMember(this.selectedChannelId!, userId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            completed++;
            if (completed + errors === total) {
              // All requests completed (success or error)
              if (completed > 0) {
                // Reload channel to get updated members
                this.chatService.getChannelById(this.selectedChannelId!)
                  .pipe(takeUntil(this.destroy$))
                  .subscribe({
                    next: (channel) => {
                      const index = this.channels.findIndex(c => c.id === channel.id);
                      if (index >= 0) {
                        this.channels[index] = channel;
                      }
                      if (this.currentChannel?.id === channel.id) {
                        this.currentChannel = channel;
                      }
                      this.showAddMembersDialog = false;
                      // Reload channel details if panel is open
                      if (this.showChannelDetails && this.selectedChannelId) {
                        this.loadChannelDetails(this.selectedChannelId);
                      }
                      if (errors > 0) {
                        this.snackBarService.showSuccess(`Added ${completed} member${completed > 1 ? 's' : ''}, ${errors} failed`);
                      } else {
                        this.snackBarService.showSuccess(`Added ${completed} member${completed > 1 ? 's' : ''} successfully`);
                      }
                    }
                  });
              } else {
                this.snackBarService.showError('Failed to add members');
              }
            }
          },
          error: (error) => {
            errors++;
            if (completed + errors === total) {
              if (completed > 0) {
                // Some succeeded, reload channel
                this.chatService.getChannelById(this.selectedChannelId!)
                  .pipe(takeUntil(this.destroy$))
                  .subscribe({
                    next: (channel) => {
                      const index = this.channels.findIndex(c => c.id === channel.id);
                      if (index >= 0) {
                        this.channels[index] = channel;
                      }
                      if (this.currentChannel?.id === channel.id) {
                        this.currentChannel = channel;
                      }
                      this.showAddMembersDialog = false;
                      // Reload channel details if panel is open
                      if (this.showChannelDetails && this.selectedChannelId) {
                        this.loadChannelDetails(this.selectedChannelId);
                      }
                      this.snackBarService.showSuccess(`Added ${completed} member${completed > 1 ? 's' : ''}, ${errors} failed`);
                    }
                  });
              } else {
                this.snackBarService.showError(error || 'Failed to add members');
              }
            }
          }
        });
    });
  }

  onHeaderClick(): void {
    // Toggle channel details panel
    this.showChannelDetails = !this.showChannelDetails;
    if (this.showChannelDetails && this.selectedChannelId && !this.channelDetails) {
      this.loadChannelDetails(this.selectedChannelId);
    }
  }

  onStarClick(): void {
    if (this.currentChannel) {
      this.currentChannel.isStarred = !this.currentChannel.isStarred;
      // TODO: Update star status via API
    }
  }

  onCallClick(): void {
    // TODO: Start audio call
    console.log('Call clicked');
  }

  onVideoClick(): void {
    // TODO: Start video call
    console.log('Video clicked');
  }

  onPinClick(): void {
    // TODO: Show pinned messages
    console.log('Pin clicked');
  }

  onAddUserClick(): void {
    if (!this.selectedChannelId || this.currentChannel?.type === 'direct') {
      return;
    }
    this.addMembersDialogMode = 'add-members';
    this.currentMembers = this.currentChannelMembers.map(m => m.id);
    this.showAddMembersDialog = true;
  }

  onMembersClick(): void {
    // Show channel details panel
    this.showChannelDetails = true;
    if (this.selectedChannelId && !this.channelDetails) {
      this.loadChannelDetails(this.selectedChannelId);
    }
  }

  onSearchClick(): void {
    // TODO: Open search
    console.log('Search clicked');
  }

  onNotificationsClick(): void {
    // TODO: Show notifications
    console.log('Notifications clicked');
  }

  onMoreClick(): void {
    // TODO: Show more options menu
    console.log('More clicked');
  }

  onChannelDelete(channelId: string): void {
    // Find channel to get name for confirmation
    const channel = this.channels.find(c => c.id === channelId) || 
                    this.directMessages.find(dm => dm.id === channelId);
    
    if (!channel) {
      this.snackBarService.showError('Channel not found');
      return;
    }

    // Confirm deletion
    const channelName = channel.name;
    const confirmed = confirm(`Are you sure you want to delete "${channelName}"? This action cannot be undone.`);
    
    if (!confirmed) {
      return;
    }

    // Delete channel
    this.chatService.deleteChannel(channelId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          // Remove from local arrays
          this.channels = this.channels.filter(c => c.id !== channelId);
          this.directMessages = this.directMessages.filter(dm => dm.id !== channelId);
          
          // If deleted channel was selected, clear selection
          if (this.selectedChannelId === channelId) {
            this.selectedChannelId = null;
            this.currentChannel = null;
            this.currentChannelMembers = [];
            this.currentDirectMessageUser = undefined;
            this.messages = [];
            this.channelDetails = null;
            this.showChannelDetails = false;
          }
          
          this.snackBarService.showSuccess(`Channel "${channelName}" deleted successfully`);
          this.cdr.markForCheck();
        },
        error: (error) => {
          this.snackBarService.showError(error || 'Failed to delete channel');
        }
      });
  }

  onSendMessage(message: string): void {
    if (!this.selectedChannelId || !message.trim()) {
      return;
    }

    const currentUser = this.userSessionService.userSession;
    if (!currentUser || !currentUser.id) {
      this.snackBarService.showError('User not authenticated');
      return;
    }

    // Always use backend API for sending messages
    // The backend handles Firestore writes, MySQL updates, and proper message formatting
    // Real-time Firestore listeners will automatically pick up the new message
    this.sendMessageViaAPI(message);
  }

  /**
   * Send message via REST API (fallback)
   */
  private sendMessageViaAPI(message: string): void {
    this.chatService.sendMessage(this.selectedChannelId!, message)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (newMessage: any) => {
          // Backend returns: senderId, senderName, senderEmail, etc.
          const userId = parseInt(newMessage.senderId || newMessage.userId || '0');
          const chatMessage: ChatMessage = {
            id: newMessage.id,
            content: newMessage.content,
            userId: userId,
            channelId: newMessage.channelId || this.selectedChannelId!,
            createdAt: new Date(newMessage.createdAt),
            user: {
              id: userId,
              full_name: newMessage.senderName || newMessage.user?.full_name || 'Unknown User',
              email: newMessage.senderEmail || newMessage.user?.email || '',
              avatar_url: newMessage.senderAvatar || newMessage.user?.avatar_url || null,
              avatar_color: newMessage.senderAvatarColor || newMessage.user?.avatar_color || null,
              initials: newMessage.senderInitials || newMessage.user?.initials || null
            }
          };
          this.messages.push(chatMessage);
          // Reload messages to get latest (or just add to array if using real-time Firestore)
          if (!this.firebaseService.isInitialized()) {
            this.loadMessages(this.selectedChannelId!);
          }
        },
        error: (error) => {
          this.snackBarService.showError(error || 'Failed to send message');
        }
      });
  }

  getInputPlaceholder(): string {
    if (this.currentChannel?.type === 'direct') {
      return `Message ${this.currentDirectMessageUser?.name || 'user'}`;
    }
    return `Message #${this.currentChannel?.name || 'channel'}`;
  }

  /**
   * Get placeholder text for message input based on channel type
   */
  getMessagePlaceholder(): string {
    return this.getInputPlaceholder();
  }

  /**
   * Handle message sent event from chat-message-input component
   */
  onMessageSent(): void {
    // Message has been sent successfully via chat-message-input component
    // Real-time Firestore listener will automatically update the UI
    // If not using Firestore, reload messages
    if (!this.firebaseService.isInitialized() && this.selectedChannelId) {
      // Reload messages if not using real-time Firestore
      this.loadMessages(this.selectedChannelId);
    }
    // If using Firestore, the real-time listener will handle the update automatically
  }

  /**
   * Load channel details for channel-details component
   */
  loadChannelDetails(channelId: string): void {
    this.channelDetailsLoading = true;
    this.chatService.getChannelDetails(channelId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (details: any) => {
          // Map API response to ChannelDetails interface
          this.channelDetails = {
            id: details.id?.toString() || '',
            name: details.name || '',
            description: details.description || null,
            type: details.type || 'group',
            createdBy: {
              id: details.createdBy?.id?.toString() || '',
              fullName: details.createdBy?.fullName || details.createdBy?.full_name || '',
              email: details.createdBy?.email || '',
              avatarUrl: details.createdBy?.avatarUrl || details.createdBy?.avatar_url || null,
              avatarColor: details.createdBy?.avatarColor || details.createdBy?.avatar_color || '#3b82f6',
              initials: details.createdBy?.initials || ''
            },
            members: (details.members || []).map((m: any) => ({
              id: m.id?.toString() || '',
              fullName: m.fullName || m.full_name || '',
              email: m.email || '',
              avatarUrl: m.avatarUrl || m.avatar_url || null,
              avatarColor: m.avatarColor || m.avatar_color || '#3b82f6',
              initials: m.initials || '',
              role: m.role || 'member',
              lastReadAt: m.lastReadAt || m.last_read_at || '',
              unreadCount: m.unreadCount || m.unread_count || 0,
              isMuted: m.isMuted || m.is_muted || false
            })),
            memberCount: details.memberCount || details.member_count || 0,
            myRole: details.myRole || details.my_role || 'member',
            myUnreadCount: details.myUnreadCount || details.my_unread_count || 0,
            myLastReadAt: details.myLastReadAt || details.my_last_read_at || '',
            isArchived: details.isArchived || details.is_archived || false,
            firestorePath: details.firestorePath || details.firestore_path || '',
            lastMessageAt: details.lastMessageAt || details.last_message_at || ''
          };
          this.channelDetailsLoading = false;
          this.cdr.markForCheck();
        },
        error: (error) => {
          console.error('Failed to load channel details:', error);
          this.snackBarService.showError('Failed to load channel details');
          this.channelDetailsLoading = false;
          this.cdr.markForCheck();
        }
      });
  }

  /**
   * Handle channel name change from inline editing
   */
  onChannelNameChange(event: { name: string }): void {
    if (!this.selectedChannelId || !event.name.trim()) {
      return;
    }

    this.chatService.updateChannel(this.selectedChannelId, { name: event.name.trim() })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updatedChannel) => {
          // Reload channel details
          this.loadChannelDetails(this.selectedChannelId!);
          // Update current channel
          const index = this.channels.findIndex(c => c.id === this.selectedChannelId);
          if (index >= 0) {
            this.channels[index] = { ...this.channels[index], name: event.name.trim() };
          }
          if (this.currentChannel?.id === this.selectedChannelId) {
            this.currentChannel = { ...this.currentChannel, name: event.name.trim() };
          }
          this.snackBarService.showSuccess('Channel name updated');
          this.cdr.markForCheck();
        },
        error: (error) => {
          this.snackBarService.showError(error || 'Failed to update channel name');
        }
      });
  }

  /**
   * Handle channel description change from inline editing
   */
  onChannelDescriptionChange(event: { description: string }): void {
    if (!this.selectedChannelId) {
      return;
    }

    this.chatService.updateChannel(this.selectedChannelId, { description: event.description.trim() || null })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updatedChannel) => {
          // Reload channel details
          this.loadChannelDetails(this.selectedChannelId!);
          this.snackBarService.showSuccess('Description updated');
          this.cdr.markForCheck();
        },
        error: (error) => {
          this.snackBarService.showError(error || 'Failed to update description');
        }
      });
  }

  /**
   * Handle add members from channel details
   */
  onAddMembersFromDetails(): void {
    if (!this.selectedChannelId || !this.channelDetails) {
      return;
    }
    this.addMembersDialogMode = 'add-members';
    this.currentMembers = this.channelDetails.members.map(m => m.id);
    this.showAddMembersDialog = true;
  }

  /**
   * Handle remove member from channel
   */
  onRemoveMember(member: any): void {
    if (!this.selectedChannelId || !member?.id) {
      return;
    }

    const confirmed = confirm(`Are you sure you want to remove ${member.fullName} from this channel?`);
    if (!confirmed) return;

    this.chatService.removeMember(this.selectedChannelId, member.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          // Reload channel details
          this.loadChannelDetails(this.selectedChannelId!);
          // Reload channel list
          this.loadChannels();
          this.snackBarService.showSuccess(`${member.fullName} removed from channel`);
          this.cdr.markForCheck();
        },
        error: (error) => {
          this.snackBarService.showError(error || 'Failed to remove member');
        }
      });
  }

  /**
   * Handle update member role
   */
  onUpdateMemberRole(event: { memberId: string; role: 'owner' | 'admin' | 'member' }): void {
    if (!this.selectedChannelId || !event.memberId) {
      return;
    }

    this.chatService.updateMemberRole(this.selectedChannelId, event.memberId, event.role)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          // Reload channel details
          this.loadChannelDetails(this.selectedChannelId!);
          this.snackBarService.showSuccess(`Member role updated to ${event.role}`);
          this.cdr.markForCheck();
        },
        error: (error) => {
          this.snackBarService.showError(error || 'Failed to update member role');
        }
      });
  }

  /**
   * Handle leave channel action
   */
  onLeaveChannel(): void {
    if (!this.selectedChannelId) return;

    const confirmed = confirm('Are you sure you want to leave this channel?');
    if (!confirmed) return;

    this.chatService.leaveChannel(this.selectedChannelId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          // Remove from local arrays
          this.channels = this.channels.filter(c => c.id !== this.selectedChannelId);
          this.directMessages = this.directMessages.filter(dm => dm.id !== this.selectedChannelId);
          
          // Clear selection
          this.selectedChannelId = null;
          this.currentChannel = null;
          this.currentChannelMembers = [];
          this.currentDirectMessageUser = undefined;
          this.messages = [];
          this.channelDetails = null;
          this.showChannelDetails = false;
          
          this.snackBarService.showSuccess('Left channel successfully');
          this.cdr.markForCheck();
        },
        error: (error) => {
          this.snackBarService.showError(error || 'Failed to leave channel');
        }
      });
  }

  /**
   * Handle toggle mute for a member
   */
  onToggleMute(member: any): void {
    // TODO: Implement mute/unmute functionality
    console.log('Toggle mute for member:', member);
    this.snackBarService.showWarning('Mute functionality coming soon');
  }

  /**
   * Handle member click
   */
  onMemberClick(member: any): void {
    // TODO: Show member profile or start DM
    console.log('Member clicked:', member);
  }

  /**
   * Close channel details panel
   */
  onCloseChannelDetails(): void {
    this.showChannelDetails = false;
  }
}
