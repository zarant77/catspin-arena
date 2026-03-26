import type { SlotMathConfig } from '../MathConfig';

export const HIGH_RTP_TEST: SlotMathConfig = {
  id: 'high-rtp-test',
  label: 'High RTP Test',
  reelStrips: [
    ['H1', 'H1', 'H1', 'M1', 'L1'],
    ['H1', 'H1', 'H1', 'M1', 'L1'],
    ['H1', 'H1', 'H1', 'M1', 'L1'],
    ['H1', 'H1', 'H1', 'M1', 'L1'],
    ['H1', 'H1', 'H1', 'M1', 'L1'],
  ],
  paylines: [
    [0, 0, 0, 0, 0], // top
    [1, 1, 1, 1, 1], // middle
    [2, 2, 2, 2, 2], // bottom
    [0, 1, 2, 1, 0], // V
    [2, 1, 0, 1, 2], // ^
  ],
  paytable: {
    L1: { 3: 2, 4: 5, 5: 10 },
    L2: {},
    L3: {},
    L4: {},
    M1: { 3: 5, 4: 10, 5: 20 },
    M2: {},
    H1: { 3: 10, 4: 20, 5: 50 },
    H2: {},
  },
  stats: {
    estimatedRtp: 200,
    estimatedHitRate: 0.9,
    estimatedVolatilityIndex: 0.2,
  },
};
