import cat1n from '../avatars/cat-1-n.png';
import cat1w from '../avatars/cat-1-w.png';
import cat1l from '../avatars/cat-1-l.png';

import cat2n from '../avatars/cat-2-n.png';
import cat2w from '../avatars/cat-2-w.png';
import cat2l from '../avatars/cat-2-l.png';

import cat3n from '../avatars/cat-3-n.png';
import cat3w from '../avatars/cat-3-w.png';
import cat3l from '../avatars/cat-3-l.png';

import defn from '../avatars/default-n.png';
import defw from '../avatars/default-w.png';
import defl from '../avatars/default-l.png';

export type AvatarMood = 'n' | 'w' | 'l';

export const avatars = {
  'cat-1': { n: cat1n, w: cat1w, l: cat1l },
  'cat-2': { n: cat2n, w: cat2w, l: cat2l },
  'cat-3': { n: cat3n, w: cat3w, l: cat3l },
  default: { n: defn, w: defw, l: defl },
} as const;

export function getAvatar(value: string, mood: AvatarMood): string {
  const avatar = avatars[value as keyof typeof avatars] ?? avatars.default;
  return avatar[mood];
}
