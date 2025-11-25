import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { HttpService } from 'src/app/shared/services/http.service';
import { UserSessionService } from 'src/app/shared/services/user-session.service';
import { CHAT_ENDPOINTS } from './api.collection';
import { Channel } from '../components/chat-channel-item/chat-channel-item.component';

export interface CreateChannelRequest {
  name: string;
  description?: string;
  type: 'group' | 'public' | 'private';
  memberIds?: number[];
}

export interface ChannelResponse {
  success: boolean;
  data: {
    channel: Channel;
  };
  message?: string;
}

export interface ChannelsResponse {
  success: boolean;
  data: {
    channels: Channel[];
  };
  message?: string;
}

export interface User {
  id: number;
  full_name: string;
  email: string;
  avatar_url?: string;
  avatar_color?: string;
  initials?: string;
}

export interface UsersResponse {
  success: boolean;
  data: {
    users: User[];
  };
  message?: string;
}

export interface Message {
  id: string;
  content: string;
  userId: number;
  channelId: string;
  createdAt: string;
  user?: User;
}

export interface MessagesResponse {
  success: boolean;
  data: {
    messages: Message[];
  };
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  constructor(
    private httpService: HttpService,
    private userSessionService: UserSessionService
  ) {}

  /**
   * Get all channels for current user
   */
  getChannels(type?: 'group' | 'public' | 'private', archived?: boolean): Observable<Channel[]> {
    const params: any = {};
    if (type) params.type = type;
    if (archived !== undefined) params.archived = archived.toString();

    return this.httpService.get(CHAT_ENDPOINTS.getChannels, params).pipe(
      map((response: ChannelsResponse) => {
        if (response.success && response.data?.channels) {
          return this.mapChannels(response.data.channels);
        }
        return [];
      }),
      catchError((error) => throwError(() => this.handleError(error)))
    );
  }

  /**
   * Get direct messages for current user
   */
  getDirectMessages(): Observable<Channel[]> {
    return this.httpService.get(CHAT_ENDPOINTS.getDirectMessages).pipe(
      map((response: ChannelsResponse) => {
        console.log('📥 getDirectMessages API response:', response);
        if (response.success && response.data?.channels) {
          console.log('📋 Raw channels from API:', response.data.channels);
          const mapped = this.mapChannels(response.data.channels);
          console.log('✅ Mapped channels:', mapped);
          return mapped;
        }
        console.warn('⚠️ No channels in response or response not successful');
        return [];
      }),
      catchError((error) => {
        console.error('❌ Error in getDirectMessages:', error);
        return throwError(() => this.handleError(error));
      })
    );
  }

  /**
   * Get channel by ID
   */
  getChannelById(channelId: string): Observable<Channel> {
    const url = CHAT_ENDPOINTS.getChannelById.replace(':channelId', channelId);
    return this.httpService.get(url).pipe(
      map((response: ChannelResponse) => {
        if (response.success && response.data?.channel) {
          return this.mapChannel(response.data.channel);
        }
        throw new Error('Channel not found');
      }),
      catchError((error) => throwError(() => this.handleError(error)))
    );
  }

  /**
   * Get full channel details with members (for channel-details component)
   */
  getChannelDetails(channelId: string): Observable<any> {
    const url = CHAT_ENDPOINTS.getChannelById.replace(':channelId', channelId);
    return this.httpService.get(url).pipe(
      map((response: any) => {
        if (response.success && response.data?.channel) {
          return response.data.channel;
        }
        throw new Error('Channel not found');
      }),
      catchError((error) => throwError(() => this.handleError(error)))
    );
  }

  /**
   * Create a new channel
   */
  createChannel(request: CreateChannelRequest): Observable<Channel> {
    return this.httpService.post(CHAT_ENDPOINTS.createChannel, request).pipe(
      map((response: ChannelResponse) => {
        if (response.success && response.data?.channel) {
          return this.mapChannel(response.data.channel);
        }
        throw new Error(response.message || 'Failed to create channel');
      }),
      catchError((error) => throwError(() => this.handleError(error)))
    );
  }

  /**
   * Start a direct message conversation
   */
  startDirectMessage(userId: number): Observable<Channel> {
    return this.httpService.post(CHAT_ENDPOINTS.startDirectMessage, { userId }).pipe(
      map((response: ChannelResponse) => {
        if (response.success && response.data?.channel) {
          return this.mapChannel(response.data.channel);
        }
        throw new Error(response.message || 'Failed to start direct message');
      }),
      catchError((error) => throwError(() => this.handleError(error)))
    );
  }

  /**
   * Add a single member to a channel
   * Note: Backend expects single userId per request
   */
  addMember(channelId: string, userId: number): Observable<any> {
    const url = CHAT_ENDPOINTS.addMember.replace(':channelId', channelId);
    return this.httpService.post(url, { userId }).pipe(
      map((response: any) => {
        if (response.success) {
          return response.data;
        }
        throw new Error(response.message || 'Failed to add member');
      }),
      catchError((error) => throwError(() => this.handleError(error)))
    );
  }

  /**
   * Add multiple members to a channel (calls addMember for each)
   * @deprecated Use addMember in a loop for better error handling
   */
  addMembers(channelId: string, userIds: number[]): Observable<any> {
    if (userIds.length === 0) {
      return throwError(() => 'No users to add');
    }
    // For backward compatibility, add first user
    return this.addMember(channelId, userIds[0]);
  }

  /**
   * Get all users (for add members dialog)
   */
  getAllUsers(): Observable<User[]> {
    return this.httpService.get(CHAT_ENDPOINTS.getAllUsers).pipe(
      map((response: UsersResponse) => {
        if (response.success && response.data?.users) {
          return response.data.users;
        }
        return [];
      }),
      catchError((error) => throwError(() => this.handleError(error)))
    );
  }

  /**
   * Get messages for a channel
   */
  getMessages(channelId: string, limit: number = 50, before?: string): Observable<Message[]> {
    const url = CHAT_ENDPOINTS.getMessages.replace(':channelId', channelId);
    const params: any = { limit: limit.toString() };
    if (before) params.before = before;

    return this.httpService.get(url, params).pipe(
      map((response: MessagesResponse) => {
        if (response.success && response.data?.messages) {
          // Map backend message format to frontend format
          return response.data.messages.map((msg: any) => ({
            id: msg.id,
            content: msg.content,
            userId: parseInt(msg.senderId || msg.userId || '0'),
            channelId: msg.channelId || channelId,
            createdAt: msg.createdAt,
            // Build user object from sender fields
            user: {
              id: parseInt(msg.senderId || msg.userId || '0'),
              full_name: msg.senderName || msg.user?.full_name || 'Unknown User',
              email: msg.senderEmail || msg.user?.email || '',
              avatar_url: msg.senderAvatar || msg.user?.avatar_url || null,
              avatar_color: msg.senderAvatarColor || msg.user?.avatar_color || null,
              initials: msg.senderInitials || msg.user?.initials || null
            }
          }));
        }
        return [];
      }),
      catchError((error) => throwError(() => this.handleError(error)))
    );
  }

  /**
   * Send a message
   */
  sendMessage(channelId: string, content: string): Observable<Message> {
    const url = CHAT_ENDPOINTS.sendMessage.replace(':channelId', channelId);
    return this.httpService.post(url, { content }).pipe(
      map((response: any) => {
        if (response.success && response.data?.message) {
          return response.data.message;
        }
        throw new Error(response.message || 'Failed to send message');
      }),
      catchError((error) => throwError(() => this.handleError(error)))
    );
  }

  /**
   * Mark messages as read
   */
  markMessagesAsRead(channelId: string, firestoreMessageIds?: string[]): Observable<any> {
    const url = CHAT_ENDPOINTS.markMessagesAsRead.replace(':channelId', channelId);
    const body: any = {};
    if (firestoreMessageIds) {
      body.firestoreMessageIds = firestoreMessageIds;
    }
    return this.httpService.post(url, body).pipe(
      map((response: any) => {
        if (response.success) {
          return response.data;
        }
        throw new Error(response.message || 'Failed to mark messages as read');
      }),
      catchError((error) => throwError(() => this.handleError(error)))
    );
  }

  /**
   * Get unread counts for all channels
   */
  getUnreadCounts(): Observable<Record<string, number>> {
    return this.httpService.get(CHAT_ENDPOINTS.getUnreadCounts).pipe(
      map((response: any) => {
        if (response.success && response.data?.unreadCounts) {
          return response.data.unreadCounts;
        }
        return {};
      }),
      catchError((error) => throwError(() => this.handleError(error)))
    );
  }

  /**
   * Delete a channel
   */
  deleteChannel(channelId: string): Observable<any> {
    const url = CHAT_ENDPOINTS.deleteChannel.replace(':channelId', channelId);
    return this.httpService.delete(url).pipe(
      map((response: any) => {
        if (response.success) {
          return response.data;
        }
        throw new Error(response.message || 'Failed to delete channel');
      }),
      catchError((error) => throwError(() => this.handleError(error)))
    );
  }

  /**
   * Update channel (name, description, etc.)
   */
  updateChannel(channelId: string, updates: { name?: string; description?: string }): Observable<any> {
    const url = CHAT_ENDPOINTS.updateChannel.replace(':channelId', channelId);
    return this.httpService.put(url, updates).pipe(
      map((response: any) => {
        if (response.success && response.data?.channel) {
          return response.data.channel;
        }
        throw new Error(response.message || 'Failed to update channel');
      }),
      catchError((error) => throwError(() => this.handleError(error)))
    );
  }

  /**
   * Remove a member from a channel
   */
  removeMember(channelId: string, memberId: string): Observable<any> {
    const url = CHAT_ENDPOINTS.removeMember
      .replace(':channelId', channelId)
      .replace(':memberId', memberId);
    return this.httpService.delete(url).pipe(
      map((response: any) => {
        if (response.success) {
          return response.data;
        }
        throw new Error(response.message || 'Failed to remove member');
      }),
      catchError((error) => throwError(() => this.handleError(error)))
    );
  }

  /**
   * Update member role (owner, admin, member)
   */
  updateMemberRole(channelId: string, memberId: string, role: 'owner' | 'admin' | 'member'): Observable<any> {
    const url = CHAT_ENDPOINTS.updateMemberRole
      .replace(':channelId', channelId)
      .replace(':memberId', memberId);
    return this.httpService.patch(url, { role }).pipe(
      map((response: any) => {
        if (response.success) {
          return response.data;
        }
        throw new Error(response.message || 'Failed to update member role');
      }),
      catchError((error) => throwError(() => this.handleError(error)))
    );
  }

  /**
   * Leave a channel (remove current user as member)
   */
  leaveChannel(channelId: string): Observable<any> {
    const currentUserId = this.getCurrentUserId();
    if (!currentUserId) {
      return throwError(() => 'User not authenticated');
    }
    return this.removeMember(channelId, currentUserId.toString());
  }

  /**
   * Get Firebase custom token for authentication
   */
  getFirebaseToken(): Observable<any> {
    return this.httpService.post(CHAT_ENDPOINTS.getFirebaseToken, {}).pipe(
      map((response: any) => {
        // Backend returns firebaseToken, not token
        if (response.success && (response.data?.firebaseToken || response.data?.token)) {
          return response;
        }
        throw new Error(response.message || 'Failed to get Firebase token: Invalid response');
      }),
      catchError((error) => {
        console.error('Error getting Firebase token:', error);
        return throwError(() => this.handleError(error));
      })
    );
  }

  /**
   * Map API channel response to Channel interface
   */
  private mapChannel(apiChannel: any): Channel {
    // Safety check
    if (!apiChannel) {
      console.error('❌ mapChannel: apiChannel is null or undefined');
      throw new Error('Cannot map null or undefined channel');
    }

    // For direct messages, find the other user from members array
    // Backend formatChannel returns members as: { id, fullName, email, avatarUrl, avatarColor, initials, ... }
    // The id is already the user id (mapped from m.user.id)
    let otherUser = undefined;
    if (apiChannel.type === 'direct' && apiChannel.members && Array.isArray(apiChannel.members)) {
      const currentUserId = this.getCurrentUserId();
      console.log('🔍 Finding other user in DM. Current userId:', currentUserId, 'Members:', apiChannel.members);
      
      const otherMember = apiChannel.members.find((m: any) => {
        if (!m) return false;
        // Backend returns: { id: string, fullName: string, ... } where id is the user id
        const memberId = m.id?.toString() || m.user_id?.toString() || '';
        const isNotCurrentUser = memberId && memberId !== currentUserId?.toString();
        console.log('  Member:', m, 'memberId:', memberId, 'isNotCurrentUser:', isNotCurrentUser);
        return isNotCurrentUser;
      });
      
      if (otherMember) {
        // Backend already flattened the user data into the member object
        // So otherMember itself contains: id, fullName, email, avatarUrl, avatarColor, initials
        if (otherMember.id || otherMember.fullName) {
          otherUser = {
            id: (otherMember.id || '').toString(),
            name: otherMember.fullName || otherMember.full_name || otherMember.name || '',
            avatarColor: otherMember.avatarColor || otherMember.avatar_color || null,
            initials: otherMember.initials || null,
            isOnline: otherMember.isOnline || false
          };
          console.log('✅ Found other user:', otherUser);
        } else {
          console.warn('⚠️ Other member found but missing id/fullName:', otherMember);
        }
      } else {
        console.warn('⚠️ No other member found in DM. Members:', apiChannel.members);
      }
    }

    // Build channel object with safe property access
    const channel: Channel = {
      id: (apiChannel.id || '').toString(),
      name: apiChannel.name || '',
      type: apiChannel.type || 'group',
      unreadCount: apiChannel.myUnreadCount || apiChannel.unreadCount || 0,
      lastMessage: apiChannel.lastMessage || undefined,
      lastMessageAt: apiChannel.lastMessageAt ? new Date(apiChannel.lastMessageAt) : undefined,
      isMuted: apiChannel.isMuted || apiChannel.is_muted || false,
      isStarred: apiChannel.isStarred || false,
      memberCount: apiChannel.memberCount || (apiChannel.members?.length || 0),
      myRole: apiChannel.myRole || undefined,
      otherUser: otherUser || undefined
    };

    return channel;
  }

  /**
   * Get current user ID from session (helper method)
   */
  private getCurrentUserId(): number | null {
    const user = this.userSessionService.userSession;
    return user?.id || null;
  }

  /**
   * Map array of API channels to Channel interface
   */
  private mapChannels(apiChannels: any[]): Channel[] {
    if (!Array.isArray(apiChannels)) {
      console.error('❌ mapChannels: apiChannels is not an array', apiChannels);
      return [];
    }
    
    return apiChannels
      .filter(channel => channel != null) // Filter out null/undefined
      .map(channel => {
        try {
          return this.mapChannel(channel);
        } catch (error) {
          console.error('❌ Error mapping channel:', error, channel);
          return null;
        }
      })
      .filter((channel): channel is Channel => channel !== null); // Remove failed mappings
  }

  /**
   * Handle API errors
   */
  private handleError(error: any): string {
    if (error?.error?.message) {
      return error.error.message;
    }
    if (error?.message) {
      return error.message;
    }
    return 'An unexpected error occurred. Please try again.';
  }
}

