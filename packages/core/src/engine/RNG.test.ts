import { describe, it, expect } from 'vitest';
import { RNG } from './RNG';

describe('RNG', () => {
  it('produces the same sequence for the same seed', () => {
    const a = new RNG(123);
    const b = new RNG(123);

    const seqA = [a.nextFloat(), a.nextFloat(), a.nextFloat()];
    const seqB = [b.nextFloat(), b.nextFloat(), b.nextFloat()];

    expect(seqA).toEqual(seqB);
  });

  it('produces values in range [0, 1)', () => {
    const rng = new RNG(1);

    for (let i = 0; i < 50; i++) {
      const value = rng.nextFloat();
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });

  it('nextInt respects bounds', () => {
    const rng = new RNG(42);

    for (let i = 0; i < 50; i++) {
      const value = rng.nextInt(10);
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(10);
    }
  });
});
