import type { PlayerId } from './Player';
import type { RoundStatus, SymbolId } from './Rules';

export type SpinGrid = readonly (readonly SymbolId[])[];

export type WinningLine = {
  readonly lineIndex: number;
  readonly symbol: SymbolId;
  readonly count: number;
  readonly multiplier: number;
};

export type SpinResult = {
  readonly grid: SpinGrid;
  readonly totalMultiplier: number;
  readonly winningLines: readonly WinningLine[];
};

export type RoundState = {
  readonly index: number;
  readonly status: RoundStatus;
  readonly startedAt: number | null;
  readonly presentingAt: number | null;
  readonly bettingClosesAt: number | null;
  readonly spinAt: number | null;
  readonly resolvedAt: number;
  readonly seed: number;
  readonly result: SpinResult | null;
  readonly winnerPlayerIds: readonly PlayerId[];
  readonly payoutAmount: number;
};

export function createRound(seed: number): RoundState {
  return {
    index: 0,
    status: 'idle',
    startedAt: null,
    presentingAt: null,
    bettingClosesAt: null,
    spinAt: null,
    resolvedAt: 0,
    seed,
    result: null,
    winnerPlayerIds: [],
    payoutAmount: 0,
  };
}
