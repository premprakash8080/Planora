import { Injectable } from '@angular/core';
import { initializeApp, FirebaseApp, getApps } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { environment } from '../../../../environments/environment';

export interface FirebaseConfig {
  projectId: string;
  apiKey: string;
  authDomain: string;
  databaseURL: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  private app: FirebaseApp | null = null;
  private firestore: Firestore | null = null;
  private initialized = false;

  constructor() {
    this.initializeFirebase();
  }

  /**
   * Initialize Firebase app and Firestore only (no Auth)
   */
  private initializeFirebase(): void {
    if (this.initialized && this.app && this.firestore) {
      return;
    }

    try {
      const firebaseConfig: FirebaseConfig = environment.firebase;

      // Validate Firebase configuration
      if (!firebaseConfig || !firebaseConfig.apiKey || !firebaseConfig.projectId) {
        throw new Error('Firebase configuration is missing or incomplete. Please check environment.ts');
      }

      // Check if Firebase is already initialized
      const existingApps = getApps();
      if (existingApps.length > 0) {
        this.app = existingApps[0];
        console.log('✅ Using existing Firebase app');
      } else {
        this.app = initializeApp(firebaseConfig);
        console.log('✅ Created new Firebase app');
      }

      // Initialize Firestore only (no Auth)
      this.firestore = getFirestore(this.app);
      if (!this.firestore) {
        throw new Error('Failed to initialize Firestore');
      }
      console.log('✅ Firestore initialized (no Auth required)');

      this.initialized = true;
      console.log('✅ Firebase initialized successfully (Firestore only)');
    } catch (error: any) {
      console.error('❌ Firebase initialization error:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        config: environment.firebase ? {
          projectId: environment.firebase.projectId,
          apiKey: environment.firebase.apiKey ? '***' + environment.firebase.apiKey.slice(-4) : 'missing',
          authDomain: environment.firebase.authDomain
        } : 'missing'
      });
      this.initialized = false;
      throw error;
    }
  }

  /**
   * Get Firestore instance
   */
  getFirestore(): Firestore | null {
    if (!this.initialized || !this.firestore) {
      console.warn('Firestore not initialized');
      return null;
    }
    return this.firestore;
  }

  /**
   * Check if Firebase is initialized
   */
  isInitialized(): boolean {
    return this.initialized && this.app !== null && this.firestore !== null;
  }
}

