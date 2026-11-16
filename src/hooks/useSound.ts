import { useCallback, useEffect, useRef } from 'react';
import { Howl } from 'howler';

export type SoundCue = 'move' | 'select' | 'open';

const sources: Record<SoundCue, string> = {
  move: '/sounds/move.mp3',
  select: '/sounds/select.mp3',
  open: '/sounds/open.mp3',
};

export function useSound() {
  const sounds = useRef<Partial<Record<SoundCue, Howl>>>({});
  const failed = useRef(new Set<SoundCue>());
  const audioContext = useRef<AudioContext | null>(null);

  const playFallbackTone = useCallback((cue: SoundCue) => {
    if (typeof window === 'undefined' || !window.AudioContext) return;

    const context = audioContext.current ?? new window.AudioContext();
    audioContext.current = context;
    if (context.state === 'suspended') void context.resume().catch(() => undefined);

    const notes: Record<SoundCue, Array<{ frequency: number; duration: number }>> = {
      move: [{ frequency: 660, duration: 0.045 }],
      select: [{ frequency: 740, duration: 0.045 }, { frequency: 988, duration: 0.065 }],
      open: [{ frequency: 440, duration: 0.045 }, { frequency: 660, duration: 0.045 }, { frequency: 880, duration: 0.075 }],
    };

    let startAt = context.currentTime;
    for (const note of notes[cue]) {
      const oscillator = context.createOscillator();
      const envelope = context.createGain();
      oscillator.type = 'square';
      oscillator.frequency.setValueAtTime(note.frequency, startAt);
      envelope.gain.setValueAtTime(0.045, startAt);
      envelope.gain.exponentialRampToValueAtTime(0.0001, startAt + note.duration);
      oscillator.connect(envelope);
      envelope.connect(context.destination);
      oscillator.start(startAt);
      oscillator.stop(startAt + note.duration);
      startAt += note.duration + 0.012;
    }
  }, []);

  const playSound = useCallback((cue: SoundCue) => {
    if (failed.current.has(cue)) {
      playFallbackTone(cue);
      return;
    }

    let sound = sounds.current[cue];
    if (!sound) {
      sound = new Howl({
        src: [sources[cue]],
        volume: 0.3,
        preload: true,
        onloaderror: () => {
          failed.current.add(cue);
          playFallbackTone(cue);
        },
        onplayerror: (_soundId, error) => {
          if (import.meta.env.DEV) console.debug(`Audio cue "${cue}" could not play.`, error);
          playFallbackTone(cue);
        },
      });
      sounds.current[cue] = sound;
    }

    sound.stop();
    sound.play();
  }, [playFallbackTone]);

  useEffect(() => () => {
    Object.values(sounds.current).forEach((sound) => sound?.unload());
    sounds.current = {};
    void audioContext.current?.close();
    audioContext.current = null;
  }, []);

  return playSound;
}
