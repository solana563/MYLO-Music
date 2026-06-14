export interface WaveformData {
  points: number[];
  peaks: { x: number; y: number }[];
  minValue: number;
  maxValue: number;
  duration: number;
}

export class WaveformGenerator {
  /**
   * Generate waveform visualization data from audio buffer
   */
  static generateFromBuffer(
    audioBuffer: AudioBuffer,
    targetWidth: number = 1000
  ): WaveformData {
    const rawData = audioBuffer.getChannelData(0);
    const samplesPerPixel = Math.floor(rawData.length / targetWidth);
    const points: number[] = [];
    const peaks: { x: number; y: number }[] = [];

    let minValue = Infinity;
    let maxValue = -Infinity;

    // Downsample audio data
    for (let i = 0; i < targetWidth; i++) {
      const start = i * samplesPerPixel;
      const end = Math.min(start + samplesPerPixel, rawData.length);
      let maxSample = 0;

      for (let j = start; j < end; j++) {
        const sample = Math.abs(rawData[j]);
        maxSample = Math.max(maxSample, sample);
      }

      points.push(maxSample);
      minValue = Math.min(minValue, maxSample);
      maxValue = Math.max(maxValue, maxSample);

      // Detect peaks
      if (i > 0 && i < targetWidth - 1) {
        if (points[i] > points[i - 1] && points[i] > points[i + 1]) {
          peaks.push({ x: i, y: points[i] });
        }
      }
    }

    return {
      points,
      peaks: peaks.slice(0, 50), // Top 50 peaks
      minValue,
      maxValue,
      duration: audioBuffer.duration
    };
  }

  /**
   * Generate color gradient based on energy density
   */
  static getColorForIntensity(intensity: number): string {
    // Map intensity (0-1) to color gradient
    if (intensity < 0.2) return '#4f46e5'; // Indigo
    if (intensity < 0.4) return '#06b6d4'; // Cyan
    if (intensity < 0.6) return '#10b981'; // Green
    if (intensity < 0.8) return '#f59e0b'; // Amber
    return '#ef4444'; // Red
  }

  /**
   * Generate SVG path for waveform visualization
   */
  static generateSVGPath(
    waveformData: WaveformData,
    width: number = 800,
    height: number = 100
  ): string {
    const points = waveformData.points;
    const range = waveformData.maxValue - waveformData.minValue || 1;
    const centerY = height / 2;
    const pointSpacing = width / points.length;

    let path = `M 0 ${centerY}`;

    for (let i = 0; i < points.length; i++) {
      const normalized = (points[i] - waveformData.minValue) / range;
      const y = centerY - (normalized - 0.5) * height;
      const x = i * pointSpacing;

      if (i === 0) {
        path += `L ${x} ${y}`;
      } else {
        // Use quadratic curves for smooth visualization
        const prevPoint = points[i - 1];
        const prevNormalized = (prevPoint - waveformData.minValue) / range;
        const prevY = centerY - (prevNormalized - 0.5) * height;
        const controlX = ((i - 1) * pointSpacing + x) / 2;
        const controlY = (prevY + y) / 2;

        path += `Q ${controlX} ${controlY} ${x} ${y}`;
      }
    }

    return path;
  }

  /**
   * Generate interactive seek bar visualization
   */
  static generateSeekBarData(
    waveformData: WaveformData,
    currentTime: number
  ): {
    path: string;
    playheadX: number;
    timeLabel: string;
  } {
    const width = 800;
    const height = 60;
    const path = this.generateSVGPath(waveformData, width, height);
    const playheadX = (currentTime / waveformData.duration) * width;
    const minutes = Math.floor(currentTime / 60);
    const seconds = Math.floor(currentTime % 60);
    const timeLabel = `${minutes}:${seconds.toString().padStart(2, '0')}`;

    return { path, playheadX, timeLabel };
  }
}

export default WaveformGenerator;
