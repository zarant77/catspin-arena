import { sounds, type SoundId } from './sounds';

const cache = new Map<SoundId, HTMLAudioElement>();

let unlocked = false;
let muted = false;

export function initAudio(): void {
  for (const id of Object.keys(sounds) as SoundId[]) {
    const audio = new Audio(sounds[id]);
    audio.preload = 'auto';
    cache.set(id, audio);
  }
}

export function unlockAudio(): void {
  unlocked = true;
}

export function setMuted(value: boolean): void {
  muted = value;
}

export function playSound(id: SoundId): void {
  if (!unlocked || muted) return;

  const base = cache.get(id);
  if (!base) return;

  // allow overlap by cloning
  const audio = base.cloneNode(true) as HTMLAudioElement;
  audio.currentTime = 0;

  void audio.play().catch(() => {});
}
