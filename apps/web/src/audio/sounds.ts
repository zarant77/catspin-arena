export type SoundDefinition = {
  readonly src: string;
  readonly volume: number;
};

export const sounds = {
  // SFX
  click: {
    src: 'assets/sfx/click.wav',
    volume: 1,
  },
  bet: {
    src: 'assets/sfx/bet.wav',
    volume: 1,
  },
  spin: {
    src: 'assets/sfx/spin.wav',
    volume: 0.7,
  },
  payline: {
    src: 'assets/sfx/payline.wav',
    volume: 0.2,
  },
  win: {
    src: 'assets/sfx/win.wav',
    volume: 1,
  },
  meow: {
    src: 'assets/sfx/meow.wav',
    volume: 1,
  },

  // Music
  main_theme: {
    src: 'assets/music/Meowami-CatCity.mp3',
    volume: 0.5,
  },
  main_theme_mix1: {
    src: 'assets/music/Meowami-CatCity-remix1.mp3',
    volume: 0.5,
  },
  main_theme_mix2: {
    src: 'assets/music/Meowami-CatCity-remix2.mp3',
    volume: 0.5,
  },
  main_theme_mix3: {
    src: 'assets/music/Meowami-CatCity-remix3.mp3',
    volume: 0.5,
  },
} as const satisfies Record<string, SoundDefinition>;

export type SoundId = keyof typeof sounds;
