import { createRound } from "../game/Round";
import { DEFAULT_GAME_CONFIG, type GameConfig } from "../game/Rules";
import type { GameId, GameState } from "../game/GameState";

function mergeConfig(overrides?: Partial<GameConfig>): GameConfig {
  if (overrides === undefined) {
    return DEFAULT_GAME_CONFIG;
  }

  return {
    ...DEFAULT_GAME_CONFIG,
    ...overrides,
    reelStrips: overrides.reelStrips ?? DEFAULT_GAME_CONFIG.reelStrips,
    paylines: overrides.paylines ?? DEFAULT_GAME_CONFIG.paylines,
    paytable: overrides.paytable ?? DEFAULT_GAME_CONFIG.paytable,
  };
}

export function createGame(args: {
  id: GameId;
  seed: number;
  config?: Partial<GameConfig>;
}): GameState {
  const config = mergeConfig(args.config);
  const normalizedSeed = args.seed >>> 0;

  return {
    id: args.id,
    status: "lobby",
    hostPlayerId: null,
    players: [],
    round: createRound(normalizedSeed),
    config,
    rngState: normalizedSeed === 0 ? 0x9e3779b9 : normalizedSeed,
    winnerPlayerId: null,
    startedPlayerCount: 0,
  };
}
