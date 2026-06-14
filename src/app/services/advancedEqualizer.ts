export interface EqualizerPreset {
  name: string;
  bands: number[]; // 10 frequency bands
  description: string;
}

export interface SpatialAudioProfile {
  name: string;
  reverbTime: number;
  dryWet: number; // 0-1 mix ratio
  characteristics: string;
}

const EQ_FREQUENCIES = [
  60, 120, 250, 500, 1000, 2000, 4000, 8000, 12000, 16000
];

const EQ_PRESETS: Record<string, EqualizerPreset> = {
  flat: {
    name: 'Flat',
    bands: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    description: 'No EQ adjustment'
  },
  bass_boost: {
    name: 'Bass Boost',
    bands: [8, 6, 2, 0, -2, -2, -1, 0, 0, 0],
    description: 'Emphasizes low frequencies'
  },
  treble_boost: {
    name: 'Treble Boost',
    bands: [0, 0, 0, 0, 2, 4, 6, 8, 8, 6],
    description: 'Emphasizes high frequencies'
  },
  vocal_boost: {
    name: 'Vocal Boost',
    bands: [-4, -2, 0, 2, 4, 3, 1, -2, -4, -6],
    description: 'Brings vocals forward in the mix'
  },
  hip_hop: {
    name: 'Hip Hop',
    bands: [6, 4, 2, 0, -2, 0, 2, 4, 5, 5],
    description: 'Optimized for hip-hop tracks'
  },
  classical: {
    name: 'Classical',
    bands: [2, 1, -1, -2, -1, 1, 2, 3, 4, 3],
    description: 'Smooth and refined sound'
  }
};

const SPATIAL_AUDIO_PROFILES: Record<string, SpatialAudioProfile> = {
  small_room: {
    name: 'Small Room',
    reverbTime: 0.5,
    dryWet: 0.3,
    characteristics: 'Intimate, detailed sound'
  },
  concert_hall: {
    name: 'Concert Hall',
    reverbTime: 2.5,
    dryWet: 0.5,
    characteristics: 'Spacious, grand acoustics'
  },
  studio: {
    name: 'Studio',
    reverbTime: 1.2,
    dryWet: 0.25,
    characteristics: 'Professional, clean recording'
  },
  cathedral: {
    name: 'Cathedral',
    reverbTime: 4.0,
    dryWet: 0.6,
    characteristics: 'Majestic, reverberant space'
  },
  live_venue: {
    name: 'Live Venue',
    reverbTime: 1.8,
    dryWet: 0.4,
    characteristics: 'Energy and presence of live performance'
  }
};

export class AdvancedEqualizer {
  private audioContext: AudioContext;
  private filters: BiquadFilterNode[] = [];
  private currentPreset: string = 'flat';
  private spatialProfile: SpatialAudioProfile = SPATIAL_AUDIO_PROFILES.studio;
  private dryWetGain: GainNode;
  private wetGain: GainNode;
  private convolver: ConvolverNode | null = null;

  constructor(audioContext: AudioContext, sourceNode: AudioNode) {
    this.audioContext = audioContext;

    // Create 10-band equalizer
    EQ_FREQUENCIES.forEach((freq, index) => {
      const filter = audioContext.createBiquadFilter();
      filter.frequency.value = freq;
      filter.type = 'peaking';
      filter.Q.value = 0.5;
      filter.gain.value = 0;

      if (index === 0) {
        sourceNode.connect(filter);
      } else {
        this.filters[index - 1].connect(filter);
      }

      this.filters.push(filter);
    });

    // Setup dry/wet gain nodes for spatial audio
    this.dryWetGain = audioContext.createGain();
    this.dryWetGain.gain.value = 0.7;
    this.filters[this.filters.length - 1].connect(this.dryWetGain);

    this.wetGain = audioContext.createGain();
    this.wetGain.gain.value = 0.3;
  }

  /**
   * Apply preset equalizer settings
   */
  applyPreset(presetName: string) {
    const preset = EQ_PRESETS[presetName];
    if (!preset) return;

    this.currentPreset = presetName;
    preset.bands.forEach((gain, index) => {
      if (this.filters[index]) {
        this.filters[index].gain.value = gain;
      }
    });
  }

  /**
   * Set individual band gain (-12 to +12 dB)
   */
  setBandGain(bandIndex: number, gain: number) {
    if (this.filters[bandIndex]) {
      this.filters[bandIndex].gain.value = Math.max(-12, Math.min(12, gain));
    }
  }

  /**
   * Get current equalizer gains
   */
  getCurrentGains(): number[] {
    return this.filters.map(f => f.gain.value);
  }

  /**
   * Apply spatial audio/reverb environment
   */
  applySpatialProfile(profileName: string) {
    const profile = SPATIAL_AUDIO_PROFILES[profileName];
    if (!profile) return;

    this.spatialProfile = profile;
    this.dryWetGain.gain.value = 1 - profile.dryWet;
    this.wetGain.gain.value = profile.dryWet;

    // In a full implementation, would create impulse responses
    // for different room profiles
  }

  /**
   * Get list of available EQ presets
   */
  getAvailablePresets(): EqualizerPreset[] {
    return Object.values(EQ_PRESETS);
  }

  /**
   * Get list of available spatial profiles
   */
  getAvailableSpatialProfiles(): SpatialAudioProfile[] {
    return Object.values(SPATIAL_AUDIO_PROFILES);
  }

  /**
   * Export current equalizer state
   */
  exportState() {
    return {
      preset: this.currentPreset,
      gains: this.getCurrentGains(),
      spatialProfile: this.spatialProfile.name
    };
  }

  /**
   * Import and restore equalizer state
   */
  importState(state: any) {
    if (state.gains) {
      state.gains.forEach((gain: number, index: number) => {
        this.setBandGain(index, gain);
      });
    }
    if (state.spatialProfile) {
      this.applySpatialProfile(state.spatialProfile);
    }
  }
}

export default AdvancedEqualizer;
