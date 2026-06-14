import { db, StoredTrack, PlayHistory, UserPreferences } from './database';

export class LocalStorageManager {
  /**
   * Add or update track in local database
   */
  async addOrUpdateTrack(track: StoredTrack): Promise<string> {
    return await db.tracks.put(track);
  }

  /**
   * Get all tracks from library
   */
  async getAllTracks(): Promise<StoredTrack[]> {
    return await db.tracks.toArray();
  }

  /**
   * Search tracks by title, artist, or album
   */
  async searchTracks(query: string): Promise<StoredTrack[]> {
    const lowerQuery = query.toLowerCase();
    return await db.tracks
      .filter(
        track =>
          track.title.toLowerCase().includes(lowerQuery) ||
          track.artist.toLowerCase().includes(lowerQuery) ||
          track.album.toLowerCase().includes(lowerQuery)
      )
      .toArray();
  }

  /**
   * Get tracks by genre
   */
  async getTracksByGenre(genre: string): Promise<StoredTrack[]> {
    return await db.tracks.where('genre').equals(genre).toArray();
  }

  /**
   * Get liked tracks
   */
  async getLikedTracks(): Promise<StoredTrack[]> {
    return await db.tracks.where('liked').equals(true).toArray();
  }

  /**
   * Toggle like status
   */
  async toggleLike(trackId: string): Promise<void> {
    const track = await db.tracks.get(trackId);
    if (track) {
      await db.tracks.update(trackId, { liked: !track.liked });
    }
  }

  /**
   * Log track playback
   */
  async logPlayback(
    trackId: string,
    duration: number,
    skipped: boolean = false
  ): Promise<void> {
    await db.playHistory.add({
      trackId,
      timestamp: new Date(),
      duration,
      skipped
    });

    // Update track play count
    const track = await db.tracks.get(trackId);
    if (track) {
      await db.tracks.update(trackId, {
        playCount: track.playCount + 1,
        lastPlayed: new Date()
      });
    }
  }

  /**
   * Get play history
   */
  async getPlayHistory(days: number = 7): Promise<PlayHistory[]> {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    return await db.playHistory
      .where('timestamp')
      .aboveOrEqual(since)
      .toArray();
  }

  /**
   * Get most played tracks
   */
  async getMostPlayedTracks(limit: number = 10): Promise<StoredTrack[]> {
    return await db.tracks
      .orderBy('playCount')
      .reverse()
      .limit(limit)
      .toArray();
  }

  /**
   * Get recently played tracks
   */
  async getRecentlyPlayedTracks(limit: number = 10): Promise<StoredTrack[]> {
    return await db.tracks
      .orderBy('lastPlayed')
      .reverse()
      .limit(limit)
      .toArray();
  }

  /**
   * Save user preferences
   */
  async savePreferences(prefs: Partial<UserPreferences>): Promise<void> {
    const existing = await db.preferences.get('preferences');
    if (existing) {
      await db.preferences.update('preferences', prefs);
    }
  }

  /**
   * Load user preferences
   */
  async getPreferences(): Promise<UserPreferences | undefined> {
    return await db.preferences.get('preferences');
  }

  /**
   * Delete track from library
   */
  async deleteTrack(trackId: string): Promise<void> {
    await db.tracks.delete(trackId);
  }

  /**
   * Clear all data (reset app)
   */
  async clearAllData(): Promise<void> {
    await db.tracks.clear();
    await db.playHistory.clear();
    await db.libraryFolders.clear();
  }

  /**
   * Export library as JSON
   */
  async exportLibrary(): Promise<string> {
    const tracks = await db.tracks.toArray();
    const preferences = await db.preferences.get('preferences');
    const folders = await db.libraryFolders.toArray();

    return JSON.stringify(
      {
        version: '1.0',
        exportDate: new Date().toISOString(),
        tracks,
        preferences,
        folders
      },
      null,
      2
    );
  }

  /**
   * Import library from JSON
   */
  async importLibrary(jsonData: string): Promise<void> {
    try {
      const data = JSON.parse(jsonData);

      if (data.tracks && Array.isArray(data.tracks)) {
        await db.tracks.bulkPut(data.tracks);
      }

      if (data.preferences) {
        await db.preferences.put(data.preferences);
      }

      if (data.folders && Array.isArray(data.folders)) {
        await db.libraryFolders.bulkPut(data.folders);
      }
    } catch (error) {
      console.error('Failed to import library:', error);
      throw new Error('Invalid library format');
    }
  }
}

export default LocalStorageManager;
