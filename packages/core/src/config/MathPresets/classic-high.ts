import type { SlotMathConfig } from '../MathConfig';

export const CLASSIC_HIGH_MATH: SlotMathConfig = {
  id: 'classic-high',
  label: 'Classic High Volatility',
  reelStrips: [
    ['L1', 'L2', 'L3', 'L4', 'L1', 'L2', 'M1', 'H1', 'L3', 'M2', 'L4', 'H2'],
    ['L2', 'L3', 'L4', 'L1', 'L2', 'L3', 'M1', 'H1', 'L4', 'M2', 'L1', 'H2'],
    ['L3', 'L4', 'L1', 'L2', 'L3', 'L4', 'M1', 'H1', 'L1', 'M2', 'L2', 'H2'],
    ['L4', 'L1', 'L2', 'L3', 'L4', 'L1', 'M1', 'H1', 'L2', 'M2', 'L3', 'H2'],
    ['L1', 'L3', 'L2', 'L4', 'L1', 'L2', 'M1', 'H1', 'L3', 'M2', 'L4', 'H2'],
  ],
  paylines: [
    [0, 0, 0, 0, 0], // top
    [1, 1, 1, 1, 1], // middle
    [2, 2, 2, 2, 2], // bottom
    [0, 1, 2, 1, 0], // V
    [2, 1, 0, 1, 2], // ^
  ],
  paytable: {
    L1: { 3: 4, 4: 8, 5: 12 },
    L2: { 3: 4, 4: 8, 5: 12 },
    L3: { 3: 5, 4: 10, 5: 16 },
    L4: { 3: 5, 4: 10, 5: 16 },
    M1: { 3: 10, 4: 20, 5: 50 },
    M2: { 3: 12, 4: 24, 5: 60 },
    H1: { 3: 25, 4: 75, 5: 175 },
    H2: { 3: 30, 4: 100, 5: 250 },
  },
  stats: {
    estimatedRtp: 96.4,
    estimatedHitRate: 0.19,
    estimatedVolatilityIndex: 2.3,
  },
};
