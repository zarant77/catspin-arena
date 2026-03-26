import type { GameState } from '../game/GameState';
import type { GameStatus, Payline, RoundStatus, SymbolId } from '../game/Rules';

export type PublicGameConfig = {
  readonly minBet: number;
  readonly maxBet: number;
  readonly bettingDurationMs: number;
  readonly spinDurationMs: number;
  readonly paylines: readonly Payline[];
  readonly paylinePresentation: {
    readonly lineDurationMs: number;
    readonly lineGapMs: number;
    readonly hideDelayMs: number;
  };
};

export type PublicPlayerState = {
  readonly id: string;
  readonly name: string;
  readonly balance: number;
  readonly currentBet: number;
  readonly lastBet: number | null;
  readonly isReady: boolean;
  readonly isConnected: boolean;
  readonly isEliminated: boolean;
  readonly lastWin: number;
};

export type PublicWinningLine = {
  readonly lineIndex: number;
  readonly symbol: SymbolId;
  readonly count: number;
  readonly multiplier: number;
};

export type PublicSpinResult = {
  readonly grid: readonly (readonly SymbolId[])[];
  readonly totalMultiplier: number;
  readonly winningLines: readonly PublicWinningLine[];
};

export type PublicRoundState = {
  readonly index: number;
  readonly status: RoundStatus;
  readonly startedAt: number | null;
  readonly bettingClosesAt: number | null;
  readonly spinAt: number | null;
  readonly result: PublicSpinResult | null;
  readonly winnerPlayerIds: readonly string[];
  readonly payoutAmount: number;
};

export type PublicGameState = {
  readonly id: string;
  readonly status: GameStatus;
  readonly hostPlayerId: string | null;
  readonly winnerPlayerId: string | null;
  readonly players: readonly PublicPlayerState[];
  readonly round: PublicRoundState;
  readonly config: PublicGameConfig;
};

export function getPublicState(state: GameState): PublicGameState {
  return {
    id: state.id,
    status: state.status,
    hostPlayerId: state.hostPlayerId,
    winnerPlayerId: state.winnerPlayerId,
    players: state.players.map((player) => ({
      id: player.id,
      name: player.name,
      balance: player.balance,
      currentBet: player.currentBet,
      lastBet: player.lastBet,
      isReady: player.isReady,
      isConnected: player.isConnected,
      isEliminated: player.isEliminated,
      lastWin: player.lastWin,
    })),
    round: {
      index: state.round.index,
      status: state.round.status,
      startedAt: state.round.startedAt,
      bettingClosesAt: state.round.bettingClosesAt,
      spinAt: state.round.spinAt,
      result:
        state.round.result === null
          ? null
          : {
              grid: state.round.result.grid.map((column) => [...column]),
              totalMultiplier: state.round.result.totalMultiplier,
              winningLines: state.round.result.winningLines.map((line) => ({
                lineIndex: line.lineIndex,
                symbol: line.symbol,
                count: line.count,
                multiplier: line.multiplier,
              })),
            },
      winnerPlayerIds: [...state.round.winnerPlayerIds],
      payoutAmount: state.round.payoutAmount,
    },
    config: {
      minBet: state.config.minBet,
      maxBet: state.config.maxBet,
      bettingDurationMs: state.config.bettingDurationMs,
      spinDurationMs: state.config.spinDurationMs,
      paylines: state.config.math.paylines,
      paylinePresentation: state.config.paylinePresentation,
    },
  };
}
