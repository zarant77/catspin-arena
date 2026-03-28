import { describe, expect, it } from 'vitest';
import { getPublicState } from './getPublicState';
import { createGame } from './createGame';
import type { GameState } from '../game/GameState';

describe('getPublicState', () => {
  it('maps internal game state to public state', () => {
    const state = createGame({
      id: 'game-public',
      seed: 5,
    });

    const pub = getPublicState(state);

    expect(pub.id).toBe('game-public');
    expect(pub.status).toBe('lobby');
    expect(pub.hostPlayerId).toBeNull();
    expect(pub.players).toHaveLength(0);
    expect(pub.round.status).toBe(state.round.status);
    expect(pub.config.mathProfileId).toBe(state.config.mathProfileId);
  });

  it('returns copied arrays for round result data', () => {
    const base = createGame({
      id: 'game-copy',
      seed: 9,
    });

    const state: GameState = {
      ...base,
      round: {
        index: 1,
        status: 'resolved',
        startedAt: 100,
        presentingAt: null,
        bettingClosesAt: null,
        spinAt: null,
        resolvedAt: 200,
        seed: 9,
        result: {
          grid: [
            ['L1', 'L2', 'L3'],
            ['L1', 'L2', 'L3'],
            ['L1', 'L2', 'L3'],
          ],
          totalMultiplier: 10,
          winningLines: [
            {
              lineIndex: 0,
              symbol: 'L1',
              count: 3,
              multiplier: 10,
            },
          ],
        },
        winnerPlayerIds: ['p1'],
        payoutAmount: 100,
      },
    };

    const pub = getPublicState(state);

    expect(pub.round.result).not.toBeNull();
    expect(pub.round.result?.grid).toEqual(state.round.result?.grid);
    expect(pub.round.winnerPlayerIds).toEqual(['p1']);

    expect(pub.round.result?.grid).not.toBe(state.round.result?.grid);
    expect(pub.round.result?.winningLines).not.toBe(state.round.result?.winningLines);
    expect(pub.round.winnerPlayerIds).not.toBe(state.round.winnerPlayerIds);
  });
});
