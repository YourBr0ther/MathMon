import { useCallback, useRef, useState, useEffect } from 'react';
import { Howl } from 'howler';

// Storage keys
const MUSIC_ENABLED_KEY = 'mathmon_music_enabled';
const MUSIC_VOLUME_KEY = 'mathmon_music_volume';

// Background music URL - calm lofi ambient track
const MUSIC_URL = '/audio/background-music.mp3';

export function useBackgroundMusic() {
  const musicRef = useRef<Howl | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isEnabled, setIsEnabled] = useState(() => {
    const saved = localStorage.getItem(MUSIC_ENABLED_KEY);
    // Default to false - user must opt-in to music
    return saved === 'true';
  });
  const [volume, setVolumeState] = useState(() => {
    const saved = localStorage.getItem(MUSIC_VOLUME_KEY);
    return saved ? parseFloat(saved) : 0.3; // Default low volume for ambient
  });
  const [isLoaded, setIsLoaded] = useState(false);

  // Initialize music
  useEffect(() => {
    musicRef.current = new Howl({
      src: [MUSIC_URL],
      volume: volume,
      loop: true,
      preload: true,
      html5: true, // Use HTML5 audio for better streaming/looping
      onload: () => {
        setIsLoaded(true);
        // Auto-play if enabled
        if (isEnabled) {
          musicRef.current?.play();
          setIsPlaying(true);
        }
      },
      onloaderror: (_id, error) => {
        console.warn('Failed to load background music:', error);
        setIsLoaded(false);
      },
      onplay: () => setIsPlaying(true),
      onpause: () => setIsPlaying(false),
      onstop: () => setIsPlaying(false),
    });

    return () => {
      musicRef.current?.unload();
    };
  }, []);

  // Handle enabled state changes
  useEffect(() => {
    if (!musicRef.current || !isLoaded) return;

    if (isEnabled) {
      musicRef.current.play();
    } else {
      musicRef.current.pause();
    }
  }, [isEnabled, isLoaded]);

  // Handle volume changes
  useEffect(() => {
    if (musicRef.current) {
      musicRef.current.volume(volume);
    }
  }, [volume]);

  // Handle tab visibility - pause when tab is hidden
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!musicRef.current || !isEnabled) return;

      if (document.hidden) {
        musicRef.current.pause();
      } else {
        musicRef.current.play();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isEnabled]);

  // Toggle music on/off
  const toggleMusic = useCallback(() => {
    setIsEnabled(prev => {
      const newValue = !prev;
      localStorage.setItem(MUSIC_ENABLED_KEY, String(newValue));
      return newValue;
    });
  }, []);

  // Set volume (0-1)
  const setVolume = useCallback((newVolume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, newVolume));
    setVolumeState(clampedVolume);
    localStorage.setItem(MUSIC_VOLUME_KEY, String(clampedVolume));
  }, []);

  // Play music (user interaction required for autoplay)
  const play = useCallback(() => {
    if (musicRef.current && isEnabled && !isPlaying) {
      musicRef.current.play();
    }
  }, [isEnabled, isPlaying]);

  // Pause music
  const pause = useCallback(() => {
    if (musicRef.current) {
      musicRef.current.pause();
    }
  }, []);

  return {
    isPlaying,
    isEnabled,
    isLoaded,
    volume,
    toggleMusic,
    setVolume,
    play,
    pause,
  };
}
