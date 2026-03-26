import type { SlotMathConfig } from '../MathConfig';

export const CLASSIC_MEDIUM_MATH: SlotMathConfig = {
  id: 'classic-medium',
  label: 'Classic Medium Volatility',
  reelStrips: [
    ['L1', 'L2', 'L3', 'L4', 'M1', 'L1', 'L2', 'H1', 'L3', 'M2', 'L4', 'H2'],
    ['L2', 'L3', 'L4', 'L1', 'M1', 'L2', 'H1', 'L3', 'M2', 'L4', 'L1', 'H2'],
    ['L3', 'L4', 'L1', 'L2', 'M1', 'L3', 'H1', 'L4', 'M2', 'L1', 'L2', 'H2'],
    ['L4', 'L1', 'L2', 'L3', 'M1', 'L4', 'H1', 'L1', 'M2', 'L2', 'L3', 'H2'],
    ['L1', 'L3', 'L2', 'L4', 'M1', 'L1', 'H1', 'L2', 'M2', 'L3', 'L4', 'H2'],
  ],
  paylines: [
    [0, 0, 0, 0, 0], // top
    [1, 1, 1, 1, 1], // middle
    [2, 2, 2, 2, 2], // bottom
    [0, 1, 2, 1, 0], // V
    [2, 1, 0, 1, 2], // ^
  ],
  paytable: {
    L1: { 3: 5, 4: 10, 5: 20 },
    L2: { 3: 5, 4: 10, 5: 20 },
    L3: { 3: 6, 4: 12, 5: 24 },
    L4: { 3: 6, 4: 12, 5: 24 },
    M1: { 3: 10, 4: 20, 5: 40 },
    M2: { 3: 12, 4: 24, 5: 50 },
    H1: { 3: 20, 4: 50, 5: 100 },
    H2: { 3: 25, 4: 60, 5: 150 },
  },
  stats: {
    estimatedRtp: 96.1,
    estimatedHitRate: 0.27,
    estimatedVolatilityIndex: 1.4,
  },
};
