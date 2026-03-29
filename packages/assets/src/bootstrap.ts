import { SLOT_SYMBOL_VIEW } from './slots';
import { avatars } from './avatars';
import { sounds } from './sounds';

type BrowserImageLike = {
  onload: (() => void) | null;
  onerror: ((error?: unknown) => void) | null;
  src: string;
};

type BrowserAudioLike = {
  preload: string;
  src: string;
  load: () => void;
  addEventListener: (type: string, listener: () => void) => void;
  removeEventListener: (type: string, listener: () => void) => void;
};

type BrowserImageConstructor = new () => BrowserImageLike;
type BrowserAudioConstructor = new (src?: string) => BrowserAudioLike;

function getImageConstructor(): BrowserImageConstructor | null {
  const value = globalThis as { Image?: BrowserImageConstructor };
  return value.Image ?? null;
}

function getAudioConstructor(): BrowserAudioConstructor | null {
  const value = globalThis as { Audio?: BrowserAudioConstructor };
  return value.Audio ?? null;
}

function preloadImage(src: string): Promise<void> {
  const ImageCtor = getImageConstructor();

  if (ImageCtor === null) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const image = new ImageCtor();

    image.onload = () => resolve();
    image.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    image.src = src;
  });
}

function collectImages(): string[] {
  const result: string[] = [];

  for (const src of Object.values(SLOT_SYMBOL_VIEW)) {
    result.push(src);
  }

  for (const avatar of Object.values(avatars)) {
    result.push(avatar.n, avatar.w, avatar.l);
  }

  return result;
}

function preloadImages(): Promise<void> {
  const images = collectImages();
  return Promise.all(images.map(preloadImage)).then(() => undefined);
}

function preloadAudio(): Promise<void> {
  const AudioCtor = getAudioConstructor();

  if (AudioCtor === null) {
    return Promise.resolve();
  }

  const promises: Promise<void>[] = [];

  for (const definition of Object.values(sounds)) {
    const audio = new AudioCtor(definition.src);
    audio.preload = 'auto';

    const promise = new Promise<void>((resolve) => {
      const done = () => {
        audio.removeEventListener('canplaythrough', done);
        audio.removeEventListener('error', done);
        resolve();
      };

      audio.addEventListener('canplaythrough', done);
      audio.addEventListener('error', done);
      audio.load();
    });

    promises.push(promise);
  }

  return Promise.all(promises).then(() => undefined);
}

export async function preloadAllAssets(): Promise<void> {
  await Promise.all([preloadImages(), preloadAudio()]);
}
