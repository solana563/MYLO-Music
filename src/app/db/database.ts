import Dexie, { Table } from 'dexie';

export interface StoredTrack {
  id: string;
  title: string;
  artist: string;
  album: string;
  genre: string;
  bpm: number;
  releaseYear: number;
  duration: number;
  filePath: string;
  fileSize: number;
  fileHash: string;
  dateAdded: Date;
  lastPlayed?: Date;
  playCount: number;
  liked: boolean;
  acousticFeatures?: {
    energy: number;
    danceability: number;
    valence: number;
  };
  waveformData?: string; // Serialized waveform
  lyrics?: string; // LRC format
}

export interface PlayHistory {
  id?: number;
  trackId: string;
  timestamp: Date;
  duration: number;
  skipped: boolean;
}

export interface UserPreferences {
  id: 'preferences';
  crossfadeDuration: number;
  crossfadeEnabled: boolean;
  crossfadeCurve: 'linear' | 'exponential' | 'ease-in' | 'ease-out';
  equalizerPreset: string;
  spatialProfile: string;
  equalizerGains: number[];
  theme: 'light' | 'dark' | 'auto';
  volume: number;
  repeatMode: 'off' | 'all' | 'one';
  shuffleEnabled: boolean;
}

export interface LibraryFolder {
  id?: number;
  path: string;
  name: string;
  dateAdded: Date;
  fileCount: number;
  lastScanned: Date;
}

export class MYLODatabase extends Dexie {
  tracks!: Table<StoredTrack>;
  playHistory!: Table<PlayHistory>;
  preferences!: Table<UserPreferences>;
  libraryFolders!: Table<LibraryFolder>;

  constructor() {
    super('MYLOMusic');
    this.version(1).stores({
      tracks: 'id, artist, genre, dateAdded, lastPlayed',
      playHistory: '++id, trackId, timestamp',
      preferences: 'id',
      libraryFolders: '++id, path'
    });
  }
}

export const db = new MYLODatabase();

// Initialize default preferences
export async function initializeDatabase() {
  const existingPrefs = await db.preferences.get('preferences');
  if (!existingPrefs) {
    await db.preferences.add({
      id: 'preferences',
      crossfadeDuration: 3,
      crossfadeEnabled: true,
      crossfadeCurve: 'exponential',
      equalizerPreset: 'flat',
      spatialProfile: 'studio',
      equalizerGains: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      theme: 'dark',
      volume: 0.75,
      repeatMode: 'off',
      shuffleEnabled: false
    });
  }
}

export default db;
