import type { Payline, Paytable, SymbolId } from '../game/Rules';

export type MathProfileId = 'classic-low' | 'classic-medium' | 'classic-high' | 'high-rtp-test';

export type MathStats = {
  readonly estimatedRtp?: number;
  readonly estimatedHitRate?: number;
  readonly estimatedVolatilityIndex?: number;
};

export type MathProfileOption = {
  readonly id: MathProfileId;
  readonly label: string;
  readonly stats?: MathStats;
};

export type SlotMathConfig = {
  readonly id: MathProfileId;
  readonly label: string;
  readonly reelStrips: readonly (readonly SymbolId[])[];
  readonly paylines: readonly Payline[];
  readonly paytable: Paytable;
  readonly stats?: MathStats;
};
