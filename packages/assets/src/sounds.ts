import click from '../sfx/click.wav';
import bet from '../sfx/bet.wav';
import spin from '../sfx/spin.wav';
import payline from '../sfx/payline.wav';
import win from '../sfx/win.wav';
import meow from '../sfx/meow.wav';

import mainTheme from '../music/Meowami-CatCity.mp3';
// import mainThemeMix1 from '../music/Meowami-CatCity-remix1.mp3';
// import mainThemeMix2 from '../music/Meowami-CatCity-remix2.mp3';
// import mainThemeMix3 from '../music/Meowami-CatCity-remix3.mp3';

export type SoundDefinition = {
  readonly src: string;
  readonly volume: number;
};

export const sounds = {
  click: {
    src: click,
    volume: 1,
  },
  bet: {
    src: bet,
    volume: 0.2,
  },
  spin: {
    src: spin,
    volume: 0.7,
  },
  payline: {
    src: payline,
    volume: 0.2,
  },
  win: {
    src: win,
    volume: 1,
  },
  meow: {
    src: meow,
    volume: 1,
  },
  main_theme: {
    src: mainTheme,
    volume: 0.5,
  },
  // main_theme_mix1: {
  //   src: mainThemeMix1,
  //   volume: 0.5,
  // },
  // main_theme_mix2: {
  //   src: mainThemeMix2,
  //   volume: 0.5,
  // },
  // main_theme_mix3: {
  //   src: mainThemeMix3,
  //   volume: 0.5,
  // },
} as const satisfies Record<string, SoundDefinition>;

export type SoundId = keyof typeof sounds;
