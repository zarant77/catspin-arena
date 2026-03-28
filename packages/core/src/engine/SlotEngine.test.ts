import { describe, expect, it } from 'vitest';
import { RNG } from './RNG';
import { SlotEngine } from './SlotEngine';

describe('SlotEngine', () => {
  const math = {
    reelStrips: [
      ['L1', 'L2', 'L3'],
      ['L1', 'L2', 'L3'],
      ['L1', 'L2', 'L3'],
    ],
  } as const;

  it('produces deterministic result for same seed', () => {
    const engine = new SlotEngine({ rows: 3, math });

    const rngA = new RNG(123);
    const rngB = new RNG(123);

    const gridA = engine.spin(rngA);
    const gridB = engine.spin(rngB);

    expect(gridA).toEqual(gridB);
  });

  it('can produce different result for different seeds', () => {
    const engine = new SlotEngine({ rows: 3, math });

    const gridA = engine.spin(new RNG(1));
    const gridB = engine.spin(new RNG(2));

    expect(gridA).not.toEqual(gridB);
  });

  it('throws if strip is empty', () => {
    const engine = new SlotEngine({
      rows: 3,
      math: {
        reelStrips: [[]],
      },
    });

    expect(() => engine.spin(new RNG(1))).toThrow('Reel strip must not be empty');
  });
});
