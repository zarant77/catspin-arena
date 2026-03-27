export type SoundId = 'click' | 'spin' | 'win' | 'lose' | 'happy_meow';

export const sounds: Record<SoundId, string> = {
  click: 'assets/sfx/click.mp3',
  spin: 'assets/sfx/spin.mp3',
  win: 'assets/sfx/win.mp3',
  lose: 'assets/sfx/lose.mp3',
  happy_meow: 'assets/sfx/happy_meow.mp3',
};
