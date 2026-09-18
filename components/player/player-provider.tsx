"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { StoreLink } from "@/lib/types";

export type PlayerTrack = {
  id: string;
  title: string;
  subtitle: string;
  audio: string;
  artwork?: string;
  href?: string;
  links?: StoreLink[];
};

type PlayerState = {
  current?: PlayerTrack;
  playing: boolean;

  time: number;
  duration: number;
  volume: number;
  muted: boolean;
  shuffle: boolean;
  repeat: boolean;
  hasQueue: boolean;
  play: (queue: PlayerTrack[], index?: number) => void;
  toggle: () => void;
  next: () => void;
  previous: () => void;
  seek: (seconds: number) => void;
  setVolume: (value: number) => void;
  toggleMuted: () => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  close: () => void;
};

const PlayerContext = createContext<PlayerState | null>(null);

export function usePlayer(): PlayerState {
  const context = useContext(PlayerContext);
  if (!context) throw new Error("usePlayer must be used inside <PlayerProvider>");
  return context;
}

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [queue, setQueue] = useState<PlayerTrack[]>([]);
  const [index, setIndex] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(1);
  const [muted, setMuted] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState(false);

  const current = index === null ? undefined : queue[index];

  const play = useCallback((nextQueue: PlayerTrack[], startIndex = 0) => {
    if (nextQueue.length === 0) return;
    setQueue(nextQueue);
    setIndex(Math.min(Math.max(startIndex, 0), nextQueue.length - 1));
    setPlaying(true);
  }, []);

  const step = useCallback(
    (delta: number) => {
      setIndex((cur) => {
        if (cur === null || queue.length === 0) return cur;
        if (shuffle && queue.length > 1) {
          let candidate = cur;
          while (candidate === cur) {
            candidate = Math.floor(Math.random() * queue.length);
          }
          return candidate;
        }
        return (cur + delta + queue.length) % queue.length;
      });
      setPlaying(true);
    },
    [queue.length, shuffle],
  );

  const next = useCallback(() => step(1), [step]);
  const previous = useCallback(() => {
    const audio = audioRef.current;
    if (audio && audio.currentTime > 3) {
      audio.currentTime = 0;
      return;
    }
    step(-1);
  }, [step]);

  const toggle = useCallback(() => {
    if (index === null) return;
    setPlaying((cur) => !cur);
  }, [index]);

  const seek = useCallback((seconds: number) => {
    const audio = audioRef.current;
    if (!audio || !Number.isFinite(seconds)) return;
    audio.currentTime = seconds;
    setTime(seconds);
  }, []);

  const setVolume = useCallback((value: number) => {
    setVolumeState(value);
    setMuted(value === 0);
  }, []);

  const close = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
    }
    setPlaying(false);
    setIndex(null);
    setQueue([]);
    setTime(0);
    setDuration(0);
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !current) return;
    if (audio.src !== new URL(current.audio, window.location.href).href) {
      audio.src = current.audio;
      setTime(0);
      setDuration(0);
    }
  }, [current]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !current) return;
    if (playing) {
      audio.play().catch(() => setPlaying(false));
    } else {
      audio.pause();
    }
  }, [playing, current]);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) audio.volume = muted ? 0 : volume;
  }, [volume, muted]);

  const value = useMemo<PlayerState>(
    () => ({
      current,
      playing,
      time,
      duration,
      volume,
      muted,
      shuffle,
      repeat,
      hasQueue: queue.length > 1,
      play,
      toggle,
      next,
      previous,
      seek,
      setVolume,
      toggleMuted: () => setMuted((cur) => !cur),
      toggleShuffle: () => setShuffle((cur) => !cur),
      toggleRepeat: () => setRepeat((cur) => !cur),
      close,
    }),
    [
      current,
      playing,
      time,
      duration,
      volume,
      muted,
      shuffle,
      repeat,
      queue.length,
      play,
      toggle,
      next,
      previous,
      seek,
      setVolume,
      close,
    ],
  );

  return (
    <PlayerContext.Provider value={value}>
      {children}
      <audio
        ref={audioRef}
        loop={repeat}
        onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
        onDurationChange={(e) =>
          setDuration(Number.isFinite(e.currentTarget.duration) ? e.currentTarget.duration : 0)
        }
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}

        onEnded={() => (queue.length > 1 ? next() : setPlaying(false))}
        onError={() => setPlaying(false)}
      />
    </PlayerContext.Provider>
  );
}
