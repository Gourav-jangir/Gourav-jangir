import { useCallback, useEffect, useRef } from 'react';
import type { Howl } from 'howler';

export type SoundCue = 'move' | 'select' | 'open' | 'break';

const sources: Record<SoundCue, string> = {
  move: '/sounds/move.mp3',
  select: '/sounds/select.mp3',
  open: '/sounds/open.mp3',
  break: '/sounds/block-break.mp3',
};

export function useSound() {
  const sounds = useRef<Partial<Record<SoundCue, Howl>>>({});
  const failed = useRef(new Set<SoundCue>());
  const loading = useRef(new Set<SoundCue>());
  const audioContext = useRef<AudioContext | null>(null);
  const mounted = useRef(true);

  const playFallbackTone = useCallback((cue: SoundCue) => {
    if (typeof window === 'undefined' || !window.AudioContext) return;

    const context = audioContext.current ?? new window.AudioContext();
    audioContext.current = context;
    if (context.state === 'suspended') void context.resume().catch(() => undefined);

    if (cue === 'break') {
      const duration = 0.075;
      const buffer = context.createBuffer(1, Math.ceil(context.sampleRate * duration), context.sampleRate);
      const samples = buffer.getChannelData(0);
      for (let index = 0; index < samples.length; index += 1) {
        const decay = 1 - index / samples.length;
        samples[index] = (Math.random() * 2 - 1) * decay * 0.55;
      }
      const noise = context.createBufferSource();
      const filter = context.createBiquadFilter();
      const noiseEnvelope = context.createGain();
      noise.buffer = buffer;
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1150, context.currentTime);
      noiseEnvelope.gain.setValueAtTime(0.18, context.currentTime);
      noiseEnvelope.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + duration);
      noise.connect(filter);
      filter.connect(noiseEnvelope);
      noiseEnvelope.connect(context.destination);
      noise.start();

      const click = context.createOscillator();
      const clickEnvelope = context.createGain();
      click.type = 'square';
      click.frequency.setValueAtTime(190, context.currentTime);
      click.frequency.exponentialRampToValueAtTime(70, context.currentTime + 0.045);
      clickEnvelope.gain.setValueAtTime(0.055, context.currentTime);
      clickEnvelope.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.05);
      click.connect(clickEnvelope);
      clickEnvelope.connect(context.destination);
      click.start();
      click.stop(context.currentTime + 0.055);
      return;
    }

    const notes: Record<Exclude<SoundCue, 'break'>, Array<{ frequency: number; duration: number }>> = {
      move: [{ frequency: 660, duration: 0.045 }],
      select: [{ frequency: 740, duration: 0.045 }, { frequency: 988, duration: 0.065 }],
      open: [{ frequency: 440, duration: 0.045 }, { frequency: 660, duration: 0.045 }, { frequency: 880, duration: 0.075 }],
    };

    let startAt = context.currentTime;
    for (const note of notes[cue as Exclude<SoundCue, 'break'>]) {
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
    if (sound) {
      sound.stop();
      sound.play();
      return;
    }

    // Keep audio libraries out of the startup bundle; the first input gets a synthesized cue immediately.
    playFallbackTone(cue);
    if (loading.current.has(cue)) return;
    loading.current.add(cue);
    void import('howler').then(({ Howl: HowlConstructor }) => {
      if (!mounted.current) return;
      const howl = new HowlConstructor({
        src: [sources[cue]],
        volume: 0.3,
        preload: true,
        onloaderror: () => { failed.current.add(cue); },
        onplayerror: (_soundId, error) => {
          if (import.meta.env.DEV) console.debug(`Audio cue "${cue}" could not play.`, error);
          playFallbackTone(cue);
        },
      });
      sounds.current[cue] = howl;
    }).catch(() => {
      failed.current.add(cue);
    }).finally(() => {
      loading.current.delete(cue);
    });
  }, [playFallbackTone]);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      Object.values(sounds.current).forEach((sound) => sound?.unload());
      sounds.current = {};
      void audioContext.current?.close();
      audioContext.current = null;
    };
  }, []);

  return playSound;
}
