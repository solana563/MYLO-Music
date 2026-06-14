import { AudioContext } from 'web-audio-api';

export interface CrossfadeConfig {
  duration: number; // 1-12 seconds
  enabled: boolean;
  curve: 'linear' | 'exponential' | 'ease-in' | 'ease-out';
}

export interface AudioAnalysis {
  amplitude: number[];
  peaks: number[];
  rms: number;
  spectralCentroid: number;
}

export class GaplessCrossfadeEngine {
  private audioContext: AudioContext;
  private sourceNodes: Map<string, AudioBufferSource> = new Map();
  private gainNodes: Map<string, GainNode> = new Map();
  private config: CrossfadeConfig;
  private isTransitioning: boolean = false;

  constructor(audioContext: AudioContext) {
    this.audioContext = audioContext;
    this.config = {
      duration: 3,
      enabled: true,
      curve: 'exponential'
    };
  }

  /**
   * Configure crossfade parameters (1-12 seconds)
   */
  setCrossfadeConfig(config: Partial<CrossfadeConfig>) {
    this.config = { ...this.config, ...config };
    // Clamp duration between 1-12 seconds
    this.config.duration = Math.max(1, Math.min(12, this.config.duration));
  }

  /**
   * Generate linear decibel ramps for smooth audio transitions
   */
  private generateDecibelRamp(
    fromGain: number,
    toGain: number,
    duration: number,
    curve: string
  ): { time: number; value: number }[] {
    const rampPoints: { time: number; value: number }[] = [];
    const steps = Math.ceil(duration * 60); // 60fps resolution

    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      let easeT = t;

      switch (curve) {
        case 'exponential':
          easeT = Math.pow(t, 2); // Exponential ease
          break;
        case 'ease-in':
          easeT = t * t;
          break;
        case 'ease-out':
          easeT = t * (2 - t);
          break;
        case 'linear':
        default:
          easeT = t;
      }

      const gain = fromGain + (toGain - fromGain) * easeT;
      rampPoints.push({ time: (i / steps) * duration, value: gain });
    }

    return rampPoints;
  }

  /**
   * Execute seamless crossfade between two audio sources
   */
  async crossfadeTo(
    currentBuffer: AudioBuffer,
    nextBuffer: AudioBuffer,
    masterGain: GainNode
  ): Promise<void> {
    if (!this.config.enabled || this.isTransitioning) {
      return;
    }

    this.isTransitioning = true;
    const startTime = this.audioContext.currentTime;
    const fadeOutDuration = this.config.duration;

    // Create ramp curves
    const fadeOutRamp = this.generateDecibelRamp(
      1,
      0,
      fadeOutDuration,
      this.config.curve
    );
    const fadeInRamp = this.generateDecibelRamp(
      0,
      1,
      fadeOutDuration,
      this.config.curve
    );

    // Schedule gain automation
    fadeOutRamp.forEach(({ time, value }) => {
      const scheduleTime = startTime + time;
      masterGain.gain.setValueAtTime(value, scheduleTime);
    });

    // Wait for crossfade to complete
    await new Promise(resolve =>
      setTimeout(resolve, fadeOutDuration * 1000)
    );

    this.isTransitioning = false;
  }

  /**
   * Analyze audio buffer for waveform visualization and metadata
   */
  async analyzeAudioBuffer(buffer: AudioBuffer): Promise<AudioAnalysis> {
    const rawData = buffer.getChannelData(0); // Use first channel
    const amplitude: number[] = [];
    const peaks: number[] = [];
    let rms = 0;

    // Downsample for visualization (e.g., 1000 points regardless of buffer length)
    const targetPoints = 1000;
    const step = Math.max(1, Math.floor(rawData.length / targetPoints));

    for (let i = 0; i < rawData.length; i += step) {
      const chunk = rawData.slice(i, Math.min(i + step, rawData.length));
      const max = Math.max(...chunk.map(Math.abs));
      amplitude.push(max);
      rms += max * max;
    }

    rms = Math.sqrt(rms / amplitude.length);

    // Detect peaks (local maxima)
    for (let i = 1; i < amplitude.length - 1; i++) {
      if (
        amplitude[i] > amplitude[i - 1] &&
        amplitude[i] > amplitude[i + 1]
      ) {
        peaks.push(i);
      }
    }

    // Calculate spectral centroid (simplified)
    let weightedSum = 0;
    for (let i = 0; i < amplitude.length; i++) {
      weightedSum += (i / amplitude.length) * amplitude[i];
    }
    const spectralCentroid = weightedSum / (amplitude.length || 1);

    return {
      amplitude,
      peaks: peaks.slice(0, 20), // Top 20 peaks
      rms,
      spectralCentroid
    };
  }
}

export default GaplessCrossfadeEngine;
