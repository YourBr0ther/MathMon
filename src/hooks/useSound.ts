import { useCallback, useRef, useState, useEffect } from 'react';
import { Howl } from 'howler';
import { SoundEffect } from '../types';

// Sound URLs - using free sound effects
const SOUND_URLS: Record<SoundEffect, string> = {
  correct: 'https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3',
  wrong: 'https://assets.mixkit.co/active_storage/sfx/2001/2001-preview.mp3',
  catch: 'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3',
  streak: 'https://assets.mixkit.co/active_storage/sfx/2020/2020-preview.mp3',
  levelUp: 'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3',
  click: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3',
  victory: 'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3',
};

// Storage key for mute preference
const MUTE_KEY = 'mathmon_muted';

export function useSound() {
  const soundsRef = useRef<Record<SoundEffect, Howl | null>>({
    correct: null,
    wrong: null,
    catch: null,
    streak: null,
    levelUp: null,
    click: null,
    victory: null,
  });
  const [isMuted, setIsMuted] = useState(() => {
    const saved = localStorage.getItem(MUTE_KEY);
    return saved === 'true';
  });
  const [isLoaded, setIsLoaded] = useState(false);

  // Initialize sounds
  useEffect(() => {
    const sounds = Object.entries(SOUND_URLS) as [SoundEffect, string][];
    let loadedCount = 0;

    sounds.forEach(([key, url]) => {
      soundsRef.current[key] = new Howl({
        src: [url],
        volume: 0.5,
        preload: true,
        onload: () => {
          loadedCount++;
          if (loadedCount === sounds.length) {
            setIsLoaded(true);
          }
        },
        onloaderror: () => {
          console.warn(`Failed to load sound: ${key}`);
          loadedCount++;
          if (loadedCount === sounds.length) {
            setIsLoaded(true);
          }
        },
      });
    });

    return () => {
      Object.values(soundsRef.current).forEach(sound => {
        if (sound) {
          sound.unload();
        }
      });
    };
  }, []);

  // Play a sound effect
  const playSound = useCallback((effect: SoundEffect) => {
    if (isMuted) return;

    const sound = soundsRef.current[effect];
    if (sound) {
      sound.play();
    }
  }, [isMuted]);

  // Toggle mute
  const toggleMute = useCallback(() => {
    setIsMuted(prev => {
      const newValue = !prev;
      localStorage.setItem(MUTE_KEY, String(newValue));
      return newValue;
    });
  }, []);

  // Set mute directly
  const setMuted = useCallback((muted: boolean) => {
    setIsMuted(muted);
    localStorage.setItem(MUTE_KEY, String(muted));
  }, []);

  return {
    playSound,
    isMuted,
    toggleMute,
    setMuted,
    isLoaded,
  };
}
