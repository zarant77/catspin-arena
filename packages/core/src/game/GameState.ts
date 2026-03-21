import type { GameConfig, GameStatus } from "./Rules";
import type { PlayerId, PlayerState } from "./Player";
import type { RoundState } from "./Round";

export type GameId = string;

export type GameState = {
  readonly id: GameId;
  readonly status: GameStatus;
  readonly hostPlayerId: PlayerId | null;
  readonly players: readonly PlayerState[];
  readonly round: RoundState;
  readonly config: GameConfig;
  readonly rngState: number;
  readonly winnerPlayerId: PlayerId | null;
  readonly startedPlayerCount: number;
};

export function getPlayerById(
  state: GameState,
  playerId: PlayerId,
): PlayerState | null {
  return state.players.find((player) => player.id === playerId) ?? null;
}

export function getActivePlayers(state: GameState): readonly PlayerState[] {
  return state.players.filter((player) => player.isEliminated === false);
}
