import { buildGameConfig, type GameConfigOverrides } from '../config/GameConfig.js';
import { PayoutCalculator } from '../engine/Payout.js';
import { RNG } from '../engine/RNG.js';
import { SlotEngine } from '../engine/SlotEngine.js';
import type { SymbolId } from '../game/Rules.js';
import type { SimulationOptions, SimulationSummary, WinDistributionEntry } from './types.js';

function createEmptySymbolCounts(): Record<SymbolId, number> {
  return {
    L1: 0,
    L2: 0,
    L3: 0,
    L4: 0,
    M1: 0,
    M2: 0,
    H1: 0,
    H2: 0,
  };
}

function toSortedWinDistribution(values: ReadonlyMap<number, number>): readonly WinDistributionEntry[] {
  return [...values.entries()]
    .sort((left, right) => left[0] - right[0])
    .map(([multiplier, count]) => ({
      multiplier,
      count,
    }));
}

function normalizeSpins(value: number): number {
  if (Number.isInteger(value) === false || value <= 0) {
    throw new Error('spins must be a positive integer');
  }

  return value;
}

function normalizeSeed(value: number | undefined): number {
  const fallback = 0x9e3779b9;

  if (value === undefined) {
    return fallback;
  }

  if (Number.isFinite(value) === false) {
    throw new Error('seed must be a finite number');
  }

  return value >>> 0;
}

function normalizeBetAmount(value: number | undefined, config: ReturnType<typeof buildGameConfig>): number {
  if (value === undefined) {
    return config.minBet;
  }

  if (Number.isFinite(value) === false) {
    throw new Error('betAmount must be a finite number');
  }

  const normalized = Math.floor(value);
  const capped = Math.min(Math.max(normalized, config.minBet), config.maxBet);

  if (capped < config.minBet) {
    throw new Error('betAmount must be within allowed bet range');
  }

  return capped;
}

export function simulateSpins(options: SimulationOptions): SimulationSummary {
  const spins = normalizeSpins(options.spins);
  const seed = normalizeSeed(options.seed);
  const configOverrides: GameConfigOverrides | undefined = options.config;
  const config = buildGameConfig(configOverrides);
  const betAmount = normalizeBetAmount(options.betAmount, config);

  const rng = new RNG(seed);

  const slotEngine = new SlotEngine({
    rows: config.rows,
    math: config.math,
  });

  const payoutCalculator = new PayoutCalculator({
    paylines: config.math.paylines,
    paytable: config.math.paytable,
  });

  let totalBet = 0;
  let totalPayout = 0;
  let winningSpins = 0;
  let totalMultiplier = 0;
  let maxMultiplier = 0;

  const winDistribution = new Map<number, number>();
  const symbolCounts = createEmptySymbolCounts();

  for (let spinIndex = 0; spinIndex < spins; spinIndex += 1) {
    const grid = slotEngine.spin(rng);
    const payout = payoutCalculator.evaluate(grid);
    const multiplier = payout.totalMultiplier;
    const payoutAmount = multiplier * betAmount;

    totalBet += betAmount;
    totalPayout += payoutAmount;
    totalMultiplier += multiplier;
    maxMultiplier = Math.max(maxMultiplier, multiplier);

    if (multiplier > 0) {
      winningSpins += 1;
      winDistribution.set(multiplier, (winDistribution.get(multiplier) ?? 0) + 1);
    }

    grid.forEach((column) => {
      column.forEach((symbol) => {
        symbolCounts[symbol] += 1;
      });
    });
  }

  return {
    spins,
    seed,
    mathProfileId: config.mathProfileId,
    betAmount,
    totalBet,
    totalPayout,
    rtp: totalBet === 0 ? 0 : totalPayout / totalBet,
    winningSpins,
    hitRate: spins === 0 ? 0 : winningSpins / spins,
    averageMultiplierPerSpin: spins === 0 ? 0 : totalMultiplier / spins,
    averageMultiplierPerWin: winningSpins === 0 ? 0 : totalMultiplier / winningSpins,
    maxMultiplier,
    winDistribution: toSortedWinDistribution(winDistribution),
    symbolCounts,
  };
}
