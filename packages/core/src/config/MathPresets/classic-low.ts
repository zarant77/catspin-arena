import type { SlotMathConfig } from '../MathConfig';

export const CLASSIC_LOW_MATH: SlotMathConfig = {
  id: 'classic-low',
  label: 'Classic Low Volatility',
  reelStrips: [
    ['L1', 'L2', 'L3', 'L4', 'M1', 'L1', 'L2', 'L3', 'M2', 'L4', 'L1', 'L2'],
    ['L2', 'L3', 'L4', 'L1', 'M1', 'L2', 'L3', 'L4', 'M2', 'L1', 'L2', 'L3'],
    ['L3', 'L4', 'L1', 'L2', 'M1', 'L3', 'L4', 'L1', 'M2', 'L2', 'L3', 'L4'],
    ['L4', 'L1', 'L2', 'L3', 'M1', 'L4', 'L1', 'L2', 'M2', 'L3', 'L4', 'L1'],
    ['L1', 'L3', 'L2', 'L4', 'M1', 'L1', 'L2', 'L3', 'M2', 'L4', 'L1', 'L2'],
  ],
  paylines: [
    [0, 0, 0, 0, 0], // top
    [1, 1, 1, 1, 1], // middle
    [2, 2, 2, 2, 2], // bottom
    [0, 1, 2, 1, 0], // V
    [2, 1, 0, 1, 2], // ^
  ],
  paytable: {
    L1: { 3: 5, 4: 8, 5: 12 },
    L2: { 3: 5, 4: 8, 5: 12 },
    L3: { 3: 6, 4: 10, 5: 14 },
    L4: { 3: 6, 4: 10, 5: 14 },
    M1: { 3: 10, 4: 15, 5: 25 },
    M2: { 3: 12, 4: 18, 5: 30 },
    H1: { 3: 18, 4: 35, 5: 60 },
    H2: { 3: 20, 4: 40, 5: 75 },
  },
  stats: {
    estimatedRtp: 94.5,
    estimatedHitRate: 0.33,
    estimatedVolatilityIndex: 0.8,
  },
};
