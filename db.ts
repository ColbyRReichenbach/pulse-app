
import { StrengthEntry, CardioEntry, MetConEntry, WorkoutLog, WorkoutType, PhaseType, UserProfile } from './types';

const DB_NAME = 'HybridPerformanceDB';
const DB_VERSION = 3; // Incremented for profile store

export interface SessionRecord {
  id: string; // YYYY-MM-DD
  week: number;
  phase: PhaseType;
  type: WorkoutType;
  title: string;
  timestamp: string;
}

export class DatabaseService {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event: any) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('sessions')) db.createObjectStore('sessions', { keyPath: 'id' });
        if (!db.objectStoreNames.contains('strength_logs')) db.createObjectStore('strength_logs', { keyPath: 'id', autoIncrement: true }).createIndex('sessionId', 'sessionId');
        if (!db.objectStoreNames.contains('cardio_logs')) db.createObjectStore('cardio_logs', { keyPath: 'sessionId' });
        if (!db.objectStoreNames.contains('metcon_logs')) db.createObjectStore('metcon_logs', { keyPath: 'sessionId' });
        if (!db.objectStoreNames.contains('profile')) db.createObjectStore('profile', { keyPath: 'id' });
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onerror = () => reject(request.error);
    });
  }

  async saveProfile(profile: UserProfile): Promise<void> {
    if (!this.db) await this.init();
    const tx = this.db!.transaction('profile', 'readwrite');
    tx.objectStore('profile').put({ ...profile, id: 'current_user' });
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async getProfile(): Promise<UserProfile | null> {
    if (!this.db) await this.init();
    return new Promise((resolve) => {
      const request = this.db!.transaction('profile', 'readonly').objectStore('profile').get('current_user');
      request.onsuccess = () => resolve(request.result || null);
    });
  }

  async saveWorkout(log: WorkoutLog, phase: PhaseType, type: WorkoutType, title: string): Promise<void> {
    if (!this.db) await this.init();
    const tx = this.db!.transaction(['sessions', 'strength_logs', 'cardio_logs', 'metcon_logs'], 'readwrite');
    
    // 1. Save Parent Session
    const session: SessionRecord = {
      id: log.date,
      week: log.week,
      phase: phase,
      type: type,
      title: title,
      timestamp: new Date().toISOString()
    };
    tx.objectStore('sessions').put(session);

    // 2. Polymorphic Table Logic
    if (log.performanceData?.strength) {
      log.performanceData.strength.forEach(entry => {
        tx.objectStore('strength_logs').add({ ...entry, sessionId: log.date });
      });
    }

    if (log.performanceData?.cardio) {
      tx.objectStore('cardio_logs').put({ ...log.performanceData.cardio, sessionId: log.date });
    }

    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async getAllSessions(): Promise<SessionRecord[]> {
    if (!this.db) await this.init();
    return new Promise((resolve) => {
      const request = this.db!.transaction('sessions', 'readonly').objectStore('sessions').getAll();
      request.onsuccess = () => resolve(request.result);
    });
  }

  async getStrengthData(): Promise<any[]> {
    if (!this.db) await this.init();
    return new Promise((resolve) => {
      const request = this.db!.transaction('strength_logs', 'readonly').objectStore('strength_logs').getAll();
      request.onsuccess = () => resolve(request.result);
    });
  }

  async getCardioData(): Promise<any[]> {
    if (!this.db) await this.init();
    return new Promise((resolve) => {
      const request = this.db!.transaction('cardio_logs', 'readonly').objectStore('cardio_logs').getAll();
      request.onsuccess = () => resolve(request.result);
    });
  }
}

export const dbService = new DatabaseService();
