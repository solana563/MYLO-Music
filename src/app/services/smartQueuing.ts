export interface TrackMetadata {
  id: string;
  title: string;
  artist: string;
  genre: string;
  bpm: number;
  releaseYear: number;
  duration: number;
  acousticFeatures?: {
    energy: number;
    danceability: number;
    valence: number; // Musical positiveness
  };
}

export interface QueueItem {
  track: TrackMetadata;
  score: number; // Recommendation score
  reason: string; // Why this track was queued
}

export class SmartQueuing {
  private library: TrackMetadata[] = [];
  private playHistory: TrackMetadata[] = [];
  private queue: QueueItem[] = [];
  private maxHistorySize = 50;

  /**
   * Initialize library from local file metadata
   */
  initializeLibrary(tracks: TrackMetadata[]) {
    this.library = tracks;
  }

  /**
   * Add track to play history for predictive analysis
   */
  logPlayback(track: TrackMetadata) {
    this.playHistory.unshift(track);
    if (this.playHistory.length > this.maxHistorySize) {
      this.playHistory.pop();
    }
  }

  /**
   * Calculate similarity score between two tracks (0-1)
   */
  private calculateSimilarity(track1: TrackMetadata, track2: TrackMetadata): number {
    let score = 0;
    let factors = 0;

    // Genre match (high weight)
    if (track1.genre === track2.genre) {
      score += 0.4;
    } else {
      score += 0.1; // Small bonus for exploring
    }
    factors += 0.4;

    // BPM proximity
    const bpmDiff = Math.abs(track1.bpm - track2.bpm);
    const bpmScore = Math.max(0, 1 - bpmDiff / 120); // Decay over 120 BPM difference
    score += bpmScore * 0.3;
    factors += 0.3;

    // Acoustic features match (if available)
    if (track1.acousticFeatures && track2.acousticFeatures) {
      const energyDiff = Math.abs(
        track1.acousticFeatures.energy - track2.acousticFeatures.energy
      );
      const danceabilityDiff = Math.abs(
        track1.acousticFeatures.danceability - track2.acousticFeatures.danceability
      );
      const acousticScore =
        (1 - energyDiff) * 0.5 + (1 - danceabilityDiff) * 0.5;
      score += acousticScore * 0.2;
    }
    factors += 0.2;

    // Artist variety (slight preference for new artists)
    if (track1.artist !== track2.artist) {
      score += 0.1;
    }
    factors += 0.1;

    return factors > 0 ? score / factors : 0;
  }

  /**
   * Generate next tracks based on current track and history
   */
  generateAutoplayQueue(currentTrack: TrackMetadata, count: number = 5): QueueItem[] {
    const scores: Map<string, number> = new Map();
    const reasons: Map<string, string> = new Map();

    // Score all library tracks
    this.library.forEach(track => {
      if (track.id === currentTrack.id) return; // Skip current track

      // Skip recently played tracks
      if (
        this.playHistory.slice(0, 10).some(t => t.id === track.id)
      ) {
        return;
      }

      const baseScore = this.calculateSimilarity(currentTrack, track);

      // Boost unplayed tracks
      const isUnplayed = !this.playHistory.some(t => t.id === track.id);
      const score = baseScore * (isUnplayed ? 1.2 : 1);

      scores.set(track.id, score);
      reasons.set(
        track.id,
        `${track.genre} track, ${track.bpm} BPM` +
          (isUnplayed ? ' (unplayed)' : '')
      );
    });

    // Sort and select top tracks
    const topTracks = Array.from(scores.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, count)
      .map(([trackId, score]) => {
        const track = this.library.find(t => t.id === trackId)!;
        return {
          track,
          score,
          reason: reasons.get(trackId) || 'Recommended'
        };
      });

    return topTracks;
  }

  /**
   * Analyze listening patterns by time of day
   */
  analyzePeakListeningTimes(): Map<number, TrackMetadata[]> {
    const timeMap = new Map<number, TrackMetadata[]>();

    for (let hour = 0; hour < 24; hour++) {
      timeMap.set(hour, []);
    }

    // This would be populated with timestamp data in real implementation
    return timeMap;
  }

  /**
   * Get next queue items
   */
  getNextItems(count: number = 5): QueueItem[] {
    return this.queue.slice(0, count);
  }

  /**
   * Clear and regenerate queue
   */
  regenerateQueue(currentTrack: TrackMetadata) {
    this.queue = this.generateAutoplayQueue(currentTrack, 10);
  }
}

export default SmartQueuing;
