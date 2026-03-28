import { describe, expect, it } from 'vitest';
import { PayoutCalculator } from './Payout';

describe('PayoutCalculator', () => {
  const paylines = [[0, 0, 0]] as const;

  const paytable = {
    L1: { 3: 10, 4: 20, 5: 50 },
    L2: {},
    L3: {},
    L4: {},
    M1: {},
    M2: {},
    H1: {},
    H2: {},
  } as const;

  it('returns multiplier for matching line', () => {
    const calculator = new PayoutCalculator({ paylines, paytable });

    const grid = [['L1'], ['L1'], ['L1']] as const;

    const result = calculator.evaluate(grid);

    expect(result.totalMultiplier).toBe(10);
    expect(result.winningLines).toHaveLength(1);
    expect(result.winningLines[0]).toEqual({
      lineIndex: 0,
      symbol: 'L1',
      count: 3,
      multiplier: 10,
    });
  });

  it('returns zero if no match', () => {
    const calculator = new PayoutCalculator({ paylines, paytable });

    const grid = [['L1'], ['L2'], ['L1']] as const;

    const result = calculator.evaluate(grid);

    expect(result.totalMultiplier).toBe(0);
    expect(result.winningLines).toHaveLength(0);
  });
});
