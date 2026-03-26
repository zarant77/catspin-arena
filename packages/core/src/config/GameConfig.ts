import type { SlotMathConfig, MathProfileId } from './MathConfig';
import { getMathConfig } from './MathRegistry';
import type { GameConfig, GameSettings, RoundRules } from '../game/Rules';

export const DEFAULT_ROUND_RULES: RoundRules = {
  missedBetPolicy: 'repeat-last',
  winnerSelectionPolicy: 'highest-bet-only',
  tiePayoutPolicy: 'split-evenly',
  payoutBasePolicy: 'highest-bet',
};

export const DEFAULT_GAME_SETTINGS: GameSettings = {
  startBalance: 50,
  minBet: 1,
  maxBet: 10,
  targetBalance: 200,
  bettingDurationMs: 10_000,
  spinDurationMs: 2_000,
  rows: 3,
  reels: 5,
  paylinePresentation: {
    lineDurationMs: 400,
    lineGapMs: 100,
    hideDelayMs: 100,
  },
};

export const DEFAULT_MATH_PROFILE_ID: MathProfileId = 'high-rtp-test';

export const DEFAULT_GAME_CONFIG: GameConfig = {
  ...DEFAULT_GAME_SETTINGS,
  roundRules: DEFAULT_ROUND_RULES,
  mathProfileId: DEFAULT_MATH_PROFILE_ID,
  math: getMathConfig(DEFAULT_MATH_PROFILE_ID),
};

export type GameConfigOverrides = Partial<Omit<GameConfig, 'math'>> & {
  readonly math?: SlotMathConfig;
};

export function buildGameConfig(overrides?: GameConfigOverrides): GameConfig {
  if (overrides === undefined) {
    return DEFAULT_GAME_CONFIG;
  }

  const mathProfileId = overrides.mathProfileId ?? DEFAULT_GAME_CONFIG.mathProfileId;
  const math = overrides.math ?? getMathConfig(mathProfileId);

  return {
    ...DEFAULT_GAME_CONFIG,
    ...overrides,
    roundRules: {
      ...DEFAULT_GAME_CONFIG.roundRules,
      ...overrides.roundRules,
    },
    paylinePresentation: {
      ...DEFAULT_GAME_CONFIG.paylinePresentation,
      ...overrides.paylinePresentation,
    },
    mathProfileId,
    math,
  };
}
