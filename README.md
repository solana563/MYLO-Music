# MYLO – My Music. My Way.

<div align="center">

![MYLO Music Player](./src/imports/image.png)

**A beautiful, feature-rich offline music player for desktop, tablet, and mobile devices.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Built with React](https://img.shields.io/badge/Built%20with-React%2018-61dafb)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178c6)](https://www.typescriptlang.org)
[![PWA Ready](https://img.shields.io/badge/PWA-Ready-5a67d8)](https://web.dev/progressive-web-apps)

[Features](#features) • [Installation](#installation) • [Architecture](#architecture) • [Development](#development) • [Contributing](#contributing)

</div>

---

## Overview

**MYLO** is a modern, open-source offline music player that puts **you** in control. No cloud streaming, no algorithm surprises—just your music, your way. Perfect for local libraries, privacy-conscious listeners, and anyone who wants a beautiful, responsive music experience across all devices.

### Why MYLO?

✨ **Completely Offline** – Play your entire music library without internet  
🎵 **Advanced Audio** – Gapless playback, 10-band EQ, spatial audio profiles  
🧠 **Smart Features** – Predictive recommendations, automatic queuing, analytics  
📱 **Cross-Platform** – Responsive design works on mobile, tablet, and desktop  
⚡ **Blazingly Fast** – Local-first architecture with zero loading delays  
🔐 **Private** – All data stays on your device; no telemetry or tracking  
📥 **Installable** – Install as a native app (PWA) on any device  

---

## Features

### 🎧 Professional Audio Engine

#### Gapless Crossfade Engine
- True seamless playback between tracks
- Customizable crossfade duration (1–12 seconds)
- Advanced easing curves: Linear, Exponential, Ease-In, Ease-Out
- Precise decibel ramp calculations for audio quality

#### Advanced 10-Band Equalizer
- 6 professionally-tuned presets:
  - **Flat** – Reference sound (no EQ)
  - **Bass Boost** – Emphasize low frequencies
  - **Treble Boost** – Crystal-clear highs
  - **Vocal Boost** – Bring vocals forward
  - **Hip Hop** – Optimized for hip-hop & rap
  - **Classical** – Smooth & refined sound
- Real-time band adjustment (±12 dB)
- Custom preset saving

#### Spatial Audio & Reverb Profiles
- **Small Room** – Intimate, detailed acoustics
- **Concert Hall** – Spacious, grand sound
- **Studio** – Professional, clean recording
- **Cathedral** – Majestic, reverberant space
- **Live Venue** – Energy of live performance

### 🎯 Smart Queuing & Discovery

#### Dynamic Autoplay
- Analyzes currently playing track
- Generates intelligent next-track recommendations based on:
  - Genre matching
  - BPM proximity (within tolerance)
  - Acoustic features (energy, danceability, valence)
  - Artist variety
  - Unplayed track prioritization

#### Predictive Analytics
- **7-Day Trend Analysis** – Track skip rate, session duration, like rate
- **Churn Risk Prediction** – Identify declining engagement patterns
- **Personalized Recommendations** – "Refresh Your Sound" when you skip too much
- **Local Analytics** – All calculations on-device; zero cloud dependency

### 📊 Advanced Features

#### Waveform Visualization
- Real-time audio buffer analysis
- Interactive seek bar with waveform display
- Color-coded intensity based on energy density
- Smooth quadratic curve rendering

#### Library Management
- **Duplicate Detection** – SHA-256 hashing to find exact duplicates
- **Low-Quality Detection** – Alerts for files under 128 kbps
- **Metadata Editor** – Edit ID3 tags and acoustic features
- **Folder Monitoring** – Auto-detect new files in library folders
- **Import/Export** – Backup and restore library as JSON

#### Synced Lyrics
- LRC format support (`[00:12.34]Lyric text`)
- Interactive sync editor with timeline stamping
- Embed lyrics into file metadata
- Real-time lyric display during playback

### 📱 Cross-Platform & Responsive

#### Desktop Experience
- Multi-panel layout (sidebar + main content + right panel)
- 4–6 column grid for album browsing
- Full-size player with advanced controls

#### Tablet Experience
- Balanced 3–4 column layout
- Touch-optimized controls (48×48px minimum)
- Landscape & portrait support

#### Mobile Experience
- Single-column, compact layout
- Floating player bar
- Gesture-friendly navigation
- Notch & safe area support

### 🔋 Offline-First Architecture

#### IndexedDB Storage
- Track metadata & acoustics
- Play history & statistics
- User preferences & settings
- Library folder permissions

#### Service Worker
- Automatic offline caching
- Network fallback strategies
- Zero connectivity required

#### PWA Installation
- Install to home screen (iOS & Android)
- Native app experience
- File handler integration
- Share target API support

---

## Installation

### Prerequisites
- **Node.js** 18+ or **pnpm** 8+
- Modern browser with Web Audio API support

### Quick Start

```bash
# Clone the repository
git clone https://github.com/solana563/MYLO-Music.git
cd MYLO-Music

# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build
```

Then open [http://localhost:5173](http://localhost:5173) in your browser.

### Installation as PWA

1. Open MYLO in your browser
2. Look for the "Install" prompt (desktop/mobile)
3. Click "Install" to add to your home screen
4. Works offline immediately

---

## Architecture

### Project Structure

```
src/
├── app/
│   ├── components/
│   │   ├── MusicPlayer.tsx         # Main player UI
│   │   ├── OfflineComponents.tsx    # Offline UI & library tools
│   │   ├── PWAInstallPrompt.tsx     # Installation prompt
│   │   └── DeviceDebugInfo.tsx      # Debug info overlay
│   ├── hooks/
│   │   ├── useAudioEngine.ts        # Audio processing hook
│   │   ├── useDeviceInfo.ts         # Device detection
│   │   ├── useResponsiveLayout.ts   # Adaptive layouts
│   │   ├── useTouchDetection.ts     # Touch & hover detection
│   │   └── useOfflineSync.ts        # Offline state tracking
│   ├── services/
│   │   ├── audioEngine.ts           # Gapless crossfade
│   │   ├── smartQueuing.ts          # Auto-queue recommendations
│   │   ├── advancedEqualizer.ts     # 10-band EQ & spatial audio
│   │   ├── predictiveAnalytics.ts   # Engagement tracking
│   │   ├── waveformGenerator.ts     # Waveform visualization
│   │   ├── libraryScanner.ts        # File system scanning
│   │   └── lyricsSync.ts            # LRC lyrics editor
│   ├── db/
│   │   ├── database.ts              # IndexedDB schema
│   │   ├── localStorageManager.ts   # Data operations
│   │   └── fileSystemManager.ts     # File system API
│   └── App.tsx                      # Root component
├── styles/
│   ├── index.css                    # Global styles
│   └── responsive.css               # Responsive design
└── main.tsx                         # Entry point

public/
├── manifest.json                    # PWA manifest
├── sw.ts                            # Service Worker
└── index.html                       # HTML shell
```

### Technology Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18 + TypeScript |
| **Styling** | Tailwind CSS 4 + PostCSS |
| **Build** | Vite 6 |
| **Audio** | Web Audio API |
| **Storage** | IndexedDB (Dexie) |
| **UI Components** | Radix UI + shadcn/ui |
| **Icons** | Lucide React |
| **Forms** | React Hook Form |
| **Routing** | React Router 7 |
| **Animations** | Motion |

---

## Development

### Available Scripts

```bash
# Development server with hot reload
pnpm dev

# Production build
pnpm build

# Type checking
pnpm type-check
```

### Key Hooks & Utilities

#### Device Detection
```typescript
import { useDeviceInfo } from './hooks/useDeviceInfo';

const device = useDeviceInfo();
if (device.isMobile) {
  // Mobile-specific logic
}
```

#### Responsive Layouts
```typescript
import { useResponsiveLayout } from './hooks/useResponsiveLayout';

const layout = useResponsiveLayout();
const gridCols = layout.gridColumns; // 1-6 based on device
```

#### Audio Engine
```typescript
import { useAudioEngine } from './hooks/useAudioEngine';

const audio = useAudioEngine();
await audio.generateWaveform(audioBuffer);
audio.applyEqualizerPreset('bass_boost');
audio.configureCrossfade({ duration: 5, enabled: true });
```

#### Local Storage
```typescript
import LocalStorageManager from './db/localStorageManager';

const manager = new LocalStorageManager();
await manager.addOrUpdateTrack(trackMetadata);
const liked = await manager.getLikedTracks();
const json = await manager.exportLibrary();
```

---

## Browser Support

| Browser | Desktop | Mobile |
|---------|---------|--------|
| **Chrome/Edge** | ✅ v90+ | ✅ v90+ |
| **Firefox** | ✅ v88+ | ✅ v88+ |
| **Safari** | ✅ v14+ | ✅ v14+ |
| **Opera** | ✅ v76+ | ✅ v76+ |

**Requirements:**
- Web Audio API support
- IndexedDB support
- Service Workers support
- File System Access API (optional, for folder browsing)

---

## Audio Format Support

✅ **Natively Supported** (via browser)
- MP3
- WAV
- AAC
- OGG
- WebM

⚠️ **Limited Support**
- FLAC (via external codec)
- M4A (Safari only)

---

## Performance

- **Bundle Size**: ~250 KB (gzipped)
- **First Load**: < 2 seconds
- **Offline**: Instant load
- **Memory**: < 100 MB (typical)
- **CPU**: < 5% at idle

---

## Roadmap

- [ ] Playlist creation & management
- [ ] Folder-based organization
- [ ] Search with filters & sorting
- [ ] Album art extraction & display
- [ ] Tag cloud visualization
- [ ] Batch metadata editing
- [ ] Audio fingerprinting for duplicates
- [ ] Lyrics search & fetching
- [ ] Desktop app (Electron)
- [ ] Multi-device sync (optional cloud)

---

## Privacy & Data

🔐 **Your data is yours:**
- All music stays on your device
- No internet connection required
- No user tracking or analytics sent to servers
- No ads or sponsored content
- Export your library anytime

---

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Write TypeScript with strict mode
- Follow React best practices
- Use meaningful commit messages
- Test responsive behavior on multiple devices
- Document new features in README

---

## License

MIT License – See [LICENSE](./LICENSE) file for details.

---

## Acknowledgments

- **Inspiration**: Spotify, Plex, Local media players
- **UI Components**: [shadcn/ui](https://ui.shadcn.com), [Radix UI](https://www.radix-ui.com)
- **Icons**: [Lucide](https://lucide.dev)
- **Audio**: [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)

---

<div align="center">

**Made with ❤️ by the MYLO community**

[Star on GitHub](https://github.com/solana563/MYLO-Music) • [Report an Issue](https://github.com/solana563/MYLO-Music/issues) • [Discussions](https://github.com/solana563/MYLO-Music/discussions)

</div>
