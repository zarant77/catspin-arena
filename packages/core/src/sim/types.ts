import type { GameConfigOverrides } from '../config/GameConfig.js';
import type { SymbolId } from '../game/Rules.js';

export type SimulationOptions = {
  readonly spins: number;
  readonly seed?: number;
  readonly betAmount?: number;
  readonly config?: GameConfigOverrides;
};

export type WinDistributionEntry = {
  readonly multiplier: number;
  readonly count: number;
};

export type SimulationSummary = {
  readonly spins: number;
  readonly seed: number;
  readonly mathProfileId: string;
  readonly betAmount: number;
  readonly totalBet: number;
  readonly totalPayout: number;
  readonly rtp: number;
  readonly winningSpins: number;
  readonly hitRate: number;
  readonly averageMultiplierPerSpin: number;
  readonly averageMultiplierPerWin: number;
  readonly maxMultiplier: number;
  readonly winDistribution: readonly WinDistributionEntry[];
  readonly symbolCounts: Readonly<Record<SymbolId, number>>;
};
