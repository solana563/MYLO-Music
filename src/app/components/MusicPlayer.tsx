import { useState, useRef, useEffect, useCallback } from "react";
import {
  Home, Search, Compass, ListMusic, Heart, Plus, Play, Pause,
  Shuffle, SkipBack, SkipForward, Repeat, Volume2, VolumeX,
  MoreHorizontal, ChevronRight, Mic2, Radio
} from "lucide-react";

const SONGS = [
  {
    id: 1,
    title: "Born in the Wild",
    artist: "Tems",
    album: "Born in the Wild",
    duration: 214,
    cover: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop",
    liked: true,
  },
  {
    id: 2,
    title: "Title/Discount",
    artist: "Omah Lay",
    album: "Boy Alone",
    duration: 198,
    cover: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=400&fit=crop",
    liked: false,
  },
  {
    id: 3,
    title: "Feel Something",
    artist: "WizKid",
    album: "More Love Less Ego",
    duration: 231,
    cover: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop",
    liked: true,
  },
  {
    id: 4,
    title: "Shape of You",
    artist: "Fireboy DML",
    album: "Playboy",
    duration: 234,
    cover: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400&h=400&fit=crop",
    liked: false,
  },
  {
    id: 5,
    title: "Bad Habits",
    artist: "Tems",
    album: "If Orange Was a Place",
    duration: 203,
    cover: "https://images.unsplash.com/photo-1504898770365-14faca6a7320?w=400&h=400&fit=crop",
    liked: true,
  },
];

const BILLBOARD = [
  {
    id: 1,
    name: "Omah Lay",
    title: "Boy Alone",
    cover: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop",
    gradient: "from-amber-800 to-amber-950",
  },
  {
    id: 2,
    name: "WizKid",
    title: "More Love Less Ego",
    cover: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&h=300&fit=crop",
    gradient: "from-rose-800 to-rose-950",
  },
  {
    id: 3,
    name: "Fireboy DML",
    title: "Playboy",
    cover: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop",
    gradient: "from-violet-800 to-violet-950",
  },
  {
    id: 4,
    name: "Tems",
    title: "Born in the Wild",
    cover: "https://images.unsplash.com/photo-1504898770365-14faca6a7320?w=300&h=300&fit=crop",
    gradient: "from-teal-800 to-teal-950",
  },
];

const PLAYLISTS = [
  { id: 1, name: "Liked Songs", count: "124 songs", color: "bg-violet-600" },
  { id: 2, name: "Top Songs – Global", count: "50 songs", color: "bg-green-600" },
  { id: 3, name: "Yah – The 4th Album", count: "12 songs", color: "bg-orange-500" },
];

function formatTime(secs: number) {
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function MusicPlayer() {
  const [currentSong, setCurrentSong] = useState(SONGS[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(0.75);
  const [isMuted, setIsMuted] = useState(false);
  const [isShuffled, setIsShuffled] = useState(false);
  const [isRepeating, setIsRepeating] = useState(false);
  const [liked, setLiked] = useState<Set<number>>(new Set(SONGS.filter(s => s.liked).map(s => s.id)));
  const [activeNav, setActiveNav] = useState("home");
  const [activeTab, setActiveTab] = useState("playlists");
  const [searchQuery, setSearchQuery] = useState("");

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopInterval = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  const startInterval = useCallback(() => {
    stopInterval();
    intervalRef.current = setInterval(() => {
      setProgress(p => {
        if (p >= currentSong.duration) {
          setIsPlaying(false);
          return currentSong.duration;
        }
        return p + 1;
      });
    }, 1000);
  }, [currentSong.duration, stopInterval]);

  useEffect(() => {
    if (isPlaying) startInterval();
    else stopInterval();
    return stopInterval;
  }, [isPlaying, startInterval, stopInterval]);

  useEffect(() => {
    setProgress(0);
  }, [currentSong.id]);

  const togglePlay = () => setIsPlaying(p => !p);
  const toggleLike = (id: number) => {
    setLiked(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const playNext = useCallback(() => {
    const idx = SONGS.findIndex(s => s.id === currentSong.id);
    const next = isShuffled
      ? SONGS[Math.floor(Math.random() * SONGS.length)]
      : SONGS[(idx + 1) % SONGS.length];
    setCurrentSong(next);
    setIsPlaying(true);
  }, [currentSong.id, isShuffled]);

  const playPrev = useCallback(() => {
    const idx = SONGS.findIndex(s => s.id === currentSong.id);
    const prev = SONGS[(idx - 1 + SONGS.length) % SONGS.length];
    setCurrentSong(prev);
    setIsPlaying(true);
  }, [currentSong.id]);

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    setProgress(Math.floor(ratio * currentSong.duration));
  };

  const handleVolumeClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setVolume(ratio);
    setIsMuted(ratio === 0);
  };

  const progressPct = currentSong.duration > 0 ? (progress / currentSong.duration) * 100 : 0;
  const volumePct = isMuted ? 0 : volume * 100;

  return (
    <div className="flex flex-col h-screen" style={{ background: "#0d0d0d", color: "#fff", fontFamily: "Inter, system-ui, sans-serif" }}>
      {/* Main layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <aside className="flex flex-col w-56 shrink-0 overflow-y-auto" style={{ background: "#111111" }}>
          {/* Brand */}
          <div className="flex items-center gap-2 px-5 py-5">
            <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: "#1db954" }}>
              <Radio size={14} color="#000" />
            </div>
            <span style={{ fontSize: "13px", fontWeight: 600, color: "#fff" }}>Find Your Tune</span>
          </div>

          {/* Nav links */}
          <nav className="px-3 space-y-0.5">
            {[
              { id: "home", label: "Home", icon: Home },
              { id: "search", label: "Search", icon: Search },
              { id: "explore", label: "Explore", icon: Compass },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveNav(id)}
                className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg transition-colors"
                style={{
                  background: activeNav === id ? "rgba(255,255,255,0.08)" : "transparent",
                  color: activeNav === id ? "#fff" : "#a0a0a0",
                  fontSize: "13px",
                }}
              >
                <Icon size={16} />
                {label}
              </button>
            ))}
          </nav>

          {/* Library */}
          <div className="mt-5 px-3">
            <div className="flex items-center justify-between px-3 mb-2">
              <span style={{ fontSize: "11px", fontWeight: 600, color: "#6b6b6b", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Your Library
              </span>
              <Mic2 size={14} style={{ color: "#6b6b6b" }} />
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mb-3">
              {["playlists", "albums", "podcasts"].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className="rounded-full px-2 py-1 capitalize transition-colors"
                  style={{
                    fontSize: "10px",
                    background: activeTab === tab ? "rgba(255,255,255,0.12)" : "transparent",
                    color: activeTab === tab ? "#fff" : "#666",
                  }}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            {/* Playlist items */}
            <div className="space-y-0.5">
              {PLAYLISTS.map(pl => (
                <button
                  key={pl.id}
                  className="flex items-center gap-2.5 w-full px-2 py-2 rounded-lg hover:bg-white/5 transition-colors text-left"
                >
                  <div className={`w-8 h-8 rounded-md ${pl.color} shrink-0`} />
                  <div>
                    <div style={{ fontSize: "12px", color: "#ddd" }}>{pl.name}</div>
                    <div style={{ fontSize: "10px", color: "#666" }}>{pl.count}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* New playlist button */}
          <div className="mt-auto px-4 pb-4">
            <button
              className="flex items-center gap-2 w-full px-3 py-2 rounded-lg border transition-colors hover:bg-white/5"
              style={{ borderColor: "rgba(255,255,255,0.12)", fontSize: "12px", color: "#aaa" }}
            >
              <Plus size={14} />
              New playlist
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto" style={{ background: "#111111" }}>
          {/* Search bar */}
          <div className="sticky top-0 z-10 px-6 py-3 flex items-center gap-3" style={{ background: "rgba(17,17,17,0.9)", backdropFilter: "blur(8px)" }}>
            <div className="flex items-center gap-2 flex-1 rounded-full px-4 py-2" style={{ background: "#1e1e1e", maxWidth: 380 }}>
              <Search size={14} style={{ color: "#666" }} />
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search for artists, songs or albums"
                className="flex-1 bg-transparent outline-none"
                style={{ fontSize: "12px", color: "#ccc" }}
              />
            </div>
          </div>

          <div className="px-6 pb-6">
            {/* Hero section */}
            <div
              className="relative overflow-hidden rounded-2xl mb-6"
              style={{ height: 240, background: "linear-gradient(135deg, #1a0a2e 0%, #2d1255 40%, #0d0d0d 100%)" }}
            >
              <img
                src={currentSong.cover}
                alt={currentSong.title}
                className="absolute inset-0 w-full h-full object-cover opacity-40"
                style={{ filter: "blur(2px)" }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />

              <div className="absolute inset-0 flex items-end p-7">
                <div>
                  <div style={{ fontSize: "10px", color: "#aaa", marginBottom: 4 }}>Tems</div>
                  <h1 style={{ fontSize: "28px", fontWeight: 700, color: "#fff", lineHeight: 1.2, marginBottom: 16 }}>
                    {currentSong.title}
                  </h1>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={togglePlay}
                      className="flex items-center gap-2 px-5 py-2 rounded-full font-medium transition-all hover:scale-105"
                      style={{ background: "#fff", color: "#000", fontSize: "13px" }}
                    >
                      {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                      {isPlaying ? "Pause" : "Play"}
                    </button>
                    <button
                      onClick={() => setIsShuffled(s => !s)}
                      className="flex items-center gap-2 px-4 py-2 rounded-full transition-all"
                      style={{
                        background: isShuffled ? "rgba(29,185,84,0.2)" : "rgba(255,255,255,0.1)",
                        color: isShuffled ? "#1db954" : "#ddd",
                        fontSize: "13px",
                        border: `1px solid ${isShuffled ? "#1db954" : "rgba(255,255,255,0.15)"}`,
                      }}
                    >
                      <Shuffle size={13} />
                      Shuffle
                    </button>
                  </div>
                </div>
              </div>

              {/* Hero album art on the right */}
              <div className="absolute right-0 top-0 h-full w-64 overflow-hidden">
                <img
                  src={currentSong.cover}
                  alt={currentSong.title}
                  className="h-full w-full object-cover"
                  style={{ maskImage: "linear-gradient(to right, transparent, black 40%)" }}
                />
              </div>
            </div>

            {/* Billboard Topchart */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 style={{ fontSize: "15px", fontWeight: 600, color: "#fff" }}>Billboard Topchart</h2>
                <button className="flex items-center gap-1 text-xs" style={{ color: "#666" }}>
                  See All <ChevronRight size={12} />
                </button>
              </div>
              <div className="grid grid-cols-4 gap-3">
                {BILLBOARD.map(artist => (
                  <button
                    key={artist.id}
                    onClick={() => {
                      const song = SONGS.find(s => s.artist === artist.name) || SONGS[artist.id - 1];
                      setCurrentSong(song);
                      setIsPlaying(true);
                    }}
                    className="group relative overflow-hidden rounded-xl transition-transform hover:scale-105"
                    style={{ aspectRatio: "3/4", background: "#1c1c1c" }}
                  >
                    <img
                      src={artist.cover}
                      alt={artist.name}
                      className="w-full h-full object-cover opacity-80 group-hover:opacity-90 transition-opacity"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-3 text-left">
                      <div style={{ fontSize: "12px", fontWeight: 600, color: "#fff" }}>{artist.name}</div>
                      <div style={{ fontSize: "10px", color: "#aaa" }}>{artist.title}</div>
                    </div>
                    <div
                      className="absolute top-2 right-2 w-8 h-8 rounded-full items-center justify-center hidden group-hover:flex transition-all"
                      style={{ background: "#1db954" }}
                    >
                      <Play size={12} color="#000" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </main>

        {/* Right Panel */}
        <aside className="flex flex-col w-64 shrink-0 overflow-y-auto" style={{ background: "#161616" }}>
          {/* Liked Songs */}
          <div className="p-4 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
            <div className="flex items-center justify-between mb-3">
              <h3 style={{ fontSize: "13px", fontWeight: 600, color: "#fff" }}>Liked Songs</h3>
              <MoreHorizontal size={14} style={{ color: "#666" }} />
            </div>
            <div className="grid grid-cols-2 gap-1.5 mb-2">
              {SONGS.slice(0, 4).map(song => (
                <img
                  key={song.id}
                  src={song.cover}
                  alt={song.title}
                  className="w-full aspect-square object-cover rounded-lg"
                />
              ))}
            </div>
            <div style={{ fontSize: "10px", color: "#666" }}>{liked.size} liked songs</div>
          </div>

          {/* Playlist */}
          <div className="flex-1 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 style={{ fontSize: "13px", fontWeight: 600, color: "#fff" }}>Playlist</h3>
              <MoreHorizontal size={14} style={{ color: "#666" }} />
            </div>
            <div className="space-y-1">
              {SONGS.map((song, i) => (
                <button
                  key={song.id}
                  onClick={() => { setCurrentSong(song); setIsPlaying(true); }}
                  className="flex items-center gap-2.5 w-full px-2 py-2 rounded-lg transition-colors hover:bg-white/5 text-left"
                  style={{ background: currentSong.id === song.id ? "rgba(255,255,255,0.08)" : "transparent" }}
                >
                  <div className="relative shrink-0">
                    <img
                      src={song.cover}
                      alt={song.title}
                      className="w-9 h-9 object-cover rounded-lg"
                    />
                    {currentSong.id === song.id && isPlaying && (
                      <div className="absolute inset-0 flex items-center justify-center rounded-lg" style={{ background: "rgba(0,0,0,0.5)" }}>
                        <Pause size={10} color="#fff" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div
                      className="truncate"
                      style={{ fontSize: "11px", fontWeight: 500, color: currentSong.id === song.id ? "#1db954" : "#ddd" }}
                    >
                      {song.title}
                    </div>
                    <div className="truncate" style={{ fontSize: "10px", color: "#666" }}>{song.artist}</div>
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); toggleLike(song.id); }}
                    className="shrink-0 transition-colors"
                  >
                    <Heart
                      size={12}
                      style={{ color: liked.has(song.id) ? "#1db954" : "#555" }}
                      fill={liked.has(song.id) ? "#1db954" : "none"}
                    />
                  </button>
                </button>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {/* Bottom Player Bar */}
      <div
        className="shrink-0 flex items-center gap-4 px-6 py-3 border-t"
        style={{ background: "#0d0d0d", borderColor: "rgba(255,255,255,0.06)", minHeight: 72 }}
      >
        {/* Current track info */}
        <div className="flex items-center gap-3 w-48 shrink-0">
          <img
            src={currentSong.cover}
            alt={currentSong.title}
            className="w-12 h-12 object-cover rounded-lg"
          />
          <div className="min-w-0">
            <div className="truncate" style={{ fontSize: "12px", fontWeight: 500, color: "#fff" }}>{currentSong.title}</div>
            <div className="truncate" style={{ fontSize: "10px", color: "#888" }}>{currentSong.artist}</div>
          </div>
          <button onClick={() => toggleLike(currentSong.id)} className="shrink-0">
            <Heart
              size={14}
              style={{ color: liked.has(currentSong.id) ? "#1db954" : "#555" }}
              fill={liked.has(currentSong.id) ? "#1db954" : "none"}
            />
          </button>
        </div>

        {/* Controls + progress */}
        <div className="flex-1 flex flex-col items-center gap-1.5">
          <div className="flex items-center gap-5">
            <button onClick={() => setIsShuffled(s => !s)} className="transition-colors">
              <Shuffle size={15} style={{ color: isShuffled ? "#1db954" : "#666" }} />
            </button>
            <button onClick={playPrev} className="transition-colors hover:text-white" style={{ color: "#aaa" }}>
              <SkipBack size={18} />
            </button>
            <button
              onClick={togglePlay}
              className="w-9 h-9 rounded-full flex items-center justify-center transition-transform hover:scale-105"
              style={{ background: "#fff" }}
            >
              {isPlaying ? <Pause size={16} color="#000" /> : <Play size={16} color="#000" />}
            </button>
            <button onClick={playNext} className="transition-colors hover:text-white" style={{ color: "#aaa" }}>
              <SkipForward size={18} />
            </button>
            <button onClick={() => setIsRepeating(r => !r)} className="transition-colors">
              <Repeat size={15} style={{ color: isRepeating ? "#1db954" : "#666" }} />
            </button>
          </div>

          {/* Progress bar */}
          <div className="flex items-center gap-2 w-full max-w-md">
            <span style={{ fontSize: "10px", color: "#666", minWidth: 32, textAlign: "right" }}>
              {formatTime(progress)}
            </span>
            <div
              className="flex-1 h-1 rounded-full cursor-pointer relative group"
              style={{ background: "rgba(255,255,255,0.12)" }}
              onClick={handleProgressClick}
            >
              <div
                className="absolute left-0 top-0 h-full rounded-full"
                style={{ width: `${progressPct}%`, background: "#fff" }}
              />
              <div
                className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ left: `${progressPct}%`, transform: `translateX(-50%) translateY(-50%)`, background: "#fff" }}
              />
            </div>
            <span style={{ fontSize: "10px", color: "#666", minWidth: 32 }}>
              {formatTime(currentSong.duration)}
            </span>
          </div>
        </div>

        {/* Volume */}
        <div className="flex items-center gap-2 w-36 shrink-0 justify-end">
          <button onClick={() => setIsMuted(m => !m)} className="transition-colors" style={{ color: "#aaa" }}>
            {isMuted || volume === 0 ? <VolumeX size={15} /> : <Volume2 size={15} />}
          </button>
          <div
            className="flex-1 h-1 rounded-full cursor-pointer relative group"
            style={{ background: "rgba(255,255,255,0.12)" }}
            onClick={handleVolumeClick}
          >
            <div
              className="absolute left-0 top-0 h-full rounded-full"
              style={{ width: `${volumePct}%`, background: "#fff" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
