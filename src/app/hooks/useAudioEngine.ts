import { useEffect, useRef, useState } from 'react';
import GaplessCrossfadeEngine from '../services/audioEngine';
import SmartQueuing, { TrackMetadata } from '../services/smartQueuing';
import AdvancedEqualizer from '../services/advancedEqualizer';
import PredictiveAnalytics from '../services/predictiveAnalytics';
import WaveformGenerator, { WaveformData } from '../services/waveformGenerator';

export function useAudioEngine() {
  const audioContextRef = useRef<AudioContext | null>(null);
  const crossfadeEngineRef = useRef<GaplessCrossfadeEngine | null>(null);
  const smartQueuingRef = useRef<SmartQueuing | null>(null);
  const equalizerRef = useRef<AdvancedEqualizer | null>(null);
  const analyticsRef = useRef<PredictiveAnalytics | null>(null);
  const waveformRef = useRef<WaveformData | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [crossfadeSettings, setCrossfadeSettings] = useState({
    duration: 3,
    enabled: true,
    curve: 'exponential' as const
  });
  const [equalizerPreset, setEqualizerPreset] = useState('flat');
  const [spatialProfile, setSpatialProfile] = useState('studio');

  // Initialize audio engine on mount
  useEffect(() => {
    const initAudioEngine = async () => {
      try {
        const audioContext =
          new (window.AudioContext || (window as any).webkitAudioContext)();
        audioContextRef.current = audioContext;

        crossfadeEngineRef.current = new GaplessCrossfadeEngine(audioContext);
        smartQueuingRef.current = new SmartQueuing();
        analyticsRef.current = new PredictiveAnalytics();

        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize audio engine:', error);
      }
    };

    initAudioEngine();
  }, []);

  // Configure crossfade
  const configureCrossfade = (config: typeof crossfadeSettings) => {
    if (crossfadeEngineRef.current) {
      crossfadeEngineRef.current.setCrossfadeConfig({
        duration: config.duration,
        enabled: config.enabled,
        curve: config.curve
      });
      setCrossfadeSettings(config);
    }
  };

  // Apply EQ preset
  const applyEqualizerPreset = (presetName: string) => {
    if (equalizerRef.current) {
      equalizerRef.current.applyPreset(presetName);
      setEqualizerPreset(presetName);
    }
  };

  // Apply spatial audio profile
  const applySpatialAudio = (profileName: string) => {
    if (equalizerRef.current) {
      equalizerRef.current.applySpatialProfile(profileName);
      setSpatialProfile(profileName);
    }
  };

  // Initialize library for smart queuing
  const initializeLibrary = (tracks: TrackMetadata[]) => {
    if (smartQueuingRef.current) {
      smartQueuingRef.current.initializeLibrary(tracks);
    }
  };

  // Generate waveform data
  const generateWaveform = async (audioBuffer: AudioBuffer) => {
    const waveformData = WaveformGenerator.generateFromBuffer(audioBuffer);
    waveformRef.current = waveformData;
    return waveformData;
  };

  // Get smart queue recommendations
  const getSmartQueue = (currentTrack: TrackMetadata, count?: number) => {
    if (smartQueuingRef.current) {
      return smartQueuingRef.current.generateAutoplayQueue(
        currentTrack,
        count || 5
      );
    }
    return [];
  };

  // Log analytics events
  const logPlayback = (durationSeconds: number) => {
    if (analyticsRef.current) {
      analyticsRef.current.logPlayback(durationSeconds);
    }
  };

  const logSkip = () => {
    if (analyticsRef.current) {
      analyticsRef.current.logSkip();
    }
  };

  const logLike = () => {
    if (analyticsRef.current) {
      analyticsRef.current.logLike();
    }
  };

  const endSession = () => {
    if (analyticsRef.current) {
      analyticsRef.current.endSession();
    }
  };

  const getPredictiveRecommendations = (unplayedTracks: any[]) => {
    if (analyticsRef.current) {
      return analyticsRef.current.generatePersonalizedRecommendations(
        unplayedTracks,
        []
      );
    }
    return [];
  };

  return {
    isInitialized,
    crossfadeSettings,
    equalizerPreset,
    spatialProfile,
    configureCrossfade,
    applyEqualizerPreset,
    applySpatialAudio,
    initializeLibrary,
    generateWaveform,
    getSmartQueue,
    logPlayback,
    logSkip,
    logLike,
    endSession,
    getPredictiveRecommendations,
    audioContext: audioContextRef.current,
    waveformData: waveformRef.current
  };
}
