export interface LyricLine {
  timestamp: number; // Milliseconds
  text: string;
}

export interface SyncedLyrics {
  title: string;
  artist: string;
  lyrics: LyricLine[];
  format: 'lrc' | 'embedded' | 'raw';
}

export class LyricsSync {
  private currentTimestamp: number = 0;
  private syncInProgress: boolean = false;

  /**
   * Parse LRC format lyrics
   * Format: [00:12.34]Lyric text
   */
  parseLRCLyrics(lrcContent: string): LyricLine[] {
    const lines: LyricLine[] = [];
    const lrcRegex = /\[(\d{2}):(\d{2})\.(\d{2})\](.+)/g;
    let match;

    while ((match = lrcRegex.exec(lrcContent)) !== null) {
      const minutes = parseInt(match[1]);
      const seconds = parseInt(match[2]);
      const centiseconds = parseInt(match[3]);
      const timestamp = (minutes * 60 + seconds) * 1000 + centiseconds * 10;
      const text = match[4].trim();

      lines.push({ timestamp, text });
    }

    // Sort by timestamp
    return lines.sort((a, b) => a.timestamp - b.timestamp);
  }

  /**
   * Generate LRC format from synced lyrics
   */
  generateLRCFormat(lyrics: LyricLine[]): string {
    return lyrics
      .map(line => {
        const totalSeconds = Math.floor(line.timestamp / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        const centiseconds = Math.floor((line.timestamp % 1000) / 10);

        return `[${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(centiseconds).padStart(2, '0')}]${line.text}`;
      })
      .join('\n');
  }

  /**
   * Sync lyrics interactively by stamping timestamps
   */
  async syncLyricsInteractive(
    rawLyrics: string,
    onTimestampNeeded: () => Promise<number>
  ): Promise<LyricLine[]> {
    const lines = rawLyrics.split('\n').filter(line => line.trim());
    const syncedLines: LyricLine[] = [];

    for (const text of lines) {
      const timestamp = await onTimestampNeeded();
      syncedLines.push({ timestamp, text: text.trim() });
    }

    return syncedLines;
  }

  /**
   * Save synced lyrics to LRC file
   */
  async saveLRCFile(
    lyrics: LyricLine[],
    metadata: { title: string; artist: string; album: string }
  ): Promise<File> {
    let content = '';

    // Add metadata
    content += `[ti:${metadata.title}]\n`;
    content += `[ar:${metadata.artist}]\n`;
    content += `[al:${metadata.album}]\n`;
    content += '\n';

    // Add lyrics
    content += this.generateLRCFormat(lyrics);

    const blob = new Blob([content], { type: 'text/plain' });
    return new File(
      [blob],
      `${metadata.artist} - ${metadata.title}.lrc`,
      { type: 'text/plain' }
    );
  }

  /**
   * Embed synced lyrics into audio file metadata
   */
  async embedLyricsToFile(
    audioFile: File,
    lyrics: LyricLine[],
    metadata: { title: string; artist: string; album: string }
  ): Promise<File> {
    // In a real implementation, would use a library to write ID3 tags
    // This is a placeholder
    console.log(
      `Embedding ${lyrics.length} lyrics lines to ${audioFile.name}`
    );
    return audioFile;
  }

  /**
   * Get lyrics for current playback time
   */
  getLyricsForTime(lyrics: LyricLine[], currentTime: number): LyricLine | null {
    // Find the lyric line at current timestamp
    for (let i = lyrics.length - 1; i >= 0; i--) {
      if (lyrics[i].timestamp <= currentTime) {
        return lyrics[i];
      }
    }
    return null;
  }

  /**
   * Get next lyric line
   */
  getNextLyric(lyrics: LyricLine[], currentIndex: number): LyricLine | null {
    if (currentIndex < lyrics.length - 1) {
      return lyrics[currentIndex + 1];
    }
    return null;
  }

  /**
   * Calculate time until next lyric
   */
  timeToNextLyric(
    lyrics: LyricLine[],
    currentIndex: number,
    currentTime: number
  ): number {
    const nextLyric = this.getNextLyric(lyrics, currentIndex);
    if (nextLyric) {
      return Math.max(0, nextLyric.timestamp - currentTime);
    }
    return 0;
  }
}

export default LyricsSync;
