export { applyCommand } from './api/applyCommand';
export { createGame } from './api/createGame';
export { getPublicState } from './api/getPublicState';
export { tickGame } from './api/tickGame';

export {
  buildGameConfig,
  DEFAULT_GAME_CONFIG,
  DEFAULT_GAME_SETTINGS,
  DEFAULT_ROUND_RULES,
  DEFAULT_MATH_PROFILE_ID,
} from './config/GameConfig';
export { getMathConfig, getAllMathConfigs, getMathProfileOptions } from './config/MathRegistry';
export { CLASSIC_LOW_MATH, CLASSIC_MEDIUM_MATH, CLASSIC_HIGH_MATH } from './config/MathPresets';

export { RNG } from './engine/RNG';
export { SlotEngine } from './engine/SlotEngine';
export { PayoutCalculator } from './engine/Payout';

export { createPlayer } from './game/Player';
export { createRound } from './game/Round';
export { getActivePlayers, getPlayerById } from './game/GameState';

export type { GameCommand } from './api/applyCommand';
export type {
  PublicGameState,
  PublicPlayerState,
  PublicRoundState,
  PublicSpinResult,
  PublicWinningLine,
} from './api/getPublicState';
export type { GameState, GameId } from './game/GameState';
export type { PlayerState, PlayerId } from './game/Player';
export type { RoundState, SpinGrid, SpinResult, WinningLine } from './game/Round';
export type {
  GameConfig,
  GameSettings,
  GameStatus,
  RoundStatus,
  SymbolId,
  Payline,
  Paytable,
  RoundRules,
  MissedBetPolicy,
  WinnerSelectionPolicy,
  TiePayoutPolicy,
  PayoutBasePolicy,
} from './game/Rules';
export type { MathProfileId, MathProfileOption, MathStats, SlotMathConfig } from './config/MathConfig';
