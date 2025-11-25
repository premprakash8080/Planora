import { Injectable, OnDestroy } from '@angular/core';
import { 
  collection, 
  doc, 
  addDoc, 
  query, 
  orderBy, 
  limit, 
  startAfter,
  getDocs,
  onSnapshot,
  Timestamp,
  DocumentSnapshot,
  QueryDocumentSnapshot,
  Unsubscribe,
  serverTimestamp,
  where
} from 'firebase/firestore';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { FirebaseService } from './firebase.service';

export interface ChatMessage {
  id: string;
  content: string;
  userId: number;
  channelId: string;
  createdAt: Date;
  user?: {
    id: number;
    full_name: string;
    email: string;
    avatar_url?: string;
    avatar_color?: string;
    initials?: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class FirestoreChatService implements OnDestroy {
  private messageUnsubscribes: Map<string, Unsubscribe> = new Map();
  private messagesSubject: Map<string, BehaviorSubject<ChatMessage[]>> = new Map();

  constructor(private firebaseService: FirebaseService) {}

  ngOnDestroy(): void {
    // Unsubscribe from all message listeners
    this.messageUnsubscribes.forEach(unsubscribe => unsubscribe());
    this.messageUnsubscribes.clear();
    this.messagesSubject.clear();
  }

  /**
   * Get real-time messages for a channel
   */
  getMessagesRealtime(channelId: string): Observable<ChatMessage[]> {
    const firestore = this.firebaseService.getFirestore();
    if (!firestore) {
      throw new Error('Firestore not initialized');
    }

    // Return existing subject if already subscribed
    if (this.messagesSubject.has(channelId)) {
      return this.messagesSubject.get(channelId)!.asObservable();
    }

    // Create new subject for this channel
    const subject = new BehaviorSubject<ChatMessage[]>([]);
    this.messagesSubject.set(channelId, subject);

    // Set up real-time listener
    const messagesRef = collection(firestore, `chat_channels/${channelId}/messages`);
    const q = query(messagesRef, orderBy('createdAt', 'desc'), limit(50));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const messages: ChatMessage[] = [];
        snapshot.forEach((docSnapshot: QueryDocumentSnapshot) => {
          const data = docSnapshot.data();
          
          // Backend stores: senderId, senderName, senderEmail, senderAvatar, senderAvatarColor, senderInitials
          // Frontend expects: userId, user { id, full_name, email, avatar_url, avatar_color, initials }
          const senderId = parseInt(data.senderId || data.userId || '0');
          
          messages.push({
            id: docSnapshot.id,
            content: data.content || '',
            userId: senderId,
            channelId: channelId,
            createdAt: data.createdAt?.toDate() || new Date(),
            user: {
              id: senderId,
              full_name: data.senderName || data.user?.full_name || data.user?.name || 'Unknown User',
              email: data.senderEmail || data.user?.email || '',
              avatar_url: data.senderAvatar || data.user?.avatar_url || null,
              avatar_color: data.senderAvatarColor || data.user?.avatar_color || null,
              initials: data.senderInitials || data.user?.initials || null
            }
          });
        });
        // Reverse to show oldest first
        messages.reverse();
        subject.next(messages);
      },
      (error) => {
        console.error('Error listening to messages:', error);
        subject.error(error);
      }
    );

    this.messageUnsubscribes.set(channelId, unsubscribe);
    return subject.asObservable();
  }

  /**
   * Send a message to Firestore
   * Note: This should use the backend API endpoint which handles Firestore writes
   * and updates MySQL metadata. Direct Firestore writes are not recommended.
   * This method is kept for backward compatibility but should route through backend.
   */
  async sendMessage(channelId: string, content: string, userId: number): Promise<string> {
    // Note: The backend API endpoint handles Firestore writes properly
    // This method should not be used directly - use ChatService.sendMessage instead
    // Keeping this for backward compatibility but it will fail if Firestore rules require auth
    const firestore = this.firebaseService.getFirestore();
    if (!firestore) {
      throw new Error('Firestore not initialized');
    }

    const messagesRef = collection(firestore, `chat_channels/${channelId}/messages`);
    
    // Match backend format: senderId, senderName, etc.
    const messageData = {
      content: content.trim(),
      senderId: userId.toString(),
      channelId: channelId,
      createdAt: serverTimestamp()
    };

    try {
      const docRef = await addDoc(messagesRef, messageData);
      return docRef.id;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  /**
   * Get messages with pagination
   */
  async getMessages(channelId: string, limitCount: number = 50, beforeMessageId?: string): Promise<ChatMessage[]> {
    const firestore = this.firebaseService.getFirestore();
    if (!firestore) {
      throw new Error('Firestore not initialized');
    }

    const messagesRef = collection(firestore, `chat_channels/${channelId}/messages`);
    let q = query(messagesRef, orderBy('createdAt', 'desc'), limit(limitCount));

    // If beforeMessageId is provided, start after that message
    if (beforeMessageId) {
      const beforeDoc = doc(firestore, `chat_channels/${channelId}/messages/${beforeMessageId}`);
      const beforeSnapshot = await getDocs(query(doc(firestore, `chat_channels/${channelId}/messages/${beforeMessageId}`) as any));
      // Note: This is simplified - you'd need to get the actual document snapshot
      // For now, we'll just get the latest messages
    }

    const snapshot = await getDocs(q);
    const messages: ChatMessage[] = [];
    
    snapshot.forEach((docSnapshot: QueryDocumentSnapshot) => {
      const data = docSnapshot.data();
      
      // Backend stores: senderId, senderName, senderEmail, senderAvatar, senderAvatarColor, senderInitials
      const senderId = parseInt(data.senderId || data.userId || '0');
      
      messages.push({
        id: docSnapshot.id,
        content: data.content || '',
        userId: senderId,
        channelId: channelId,
        createdAt: data.createdAt?.toDate() || new Date(),
        user: {
          id: senderId,
          full_name: data.senderName || data.user?.full_name || data.user?.name || 'Unknown User',
          email: data.senderEmail || data.user?.email || '',
          avatar_url: data.senderAvatar || data.user?.avatar_url || null,
          avatar_color: data.senderAvatarColor || data.user?.avatar_color || null,
          initials: data.senderInitials || data.user?.initials || null
        }
      });
    });

    // Reverse to show oldest first
    return messages.reverse();
  }

  /**
   * Unsubscribe from messages for a channel
   */
  unsubscribeFromMessages(channelId: string): void {
    const unsubscribe = this.messageUnsubscribes.get(channelId);
    if (unsubscribe) {
      unsubscribe();
      this.messageUnsubscribes.delete(channelId);
      this.messagesSubject.delete(channelId);
    }
  }

  /**
   * Clear all subscriptions
   */
  clearAllSubscriptions(): void {
    this.messageUnsubscribes.forEach(unsubscribe => unsubscribe());
    this.messageUnsubscribes.clear();
    this.messagesSubject.clear();
  }
}

