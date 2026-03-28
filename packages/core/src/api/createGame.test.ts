import { describe, expect, it } from 'vitest';
import { createGame } from './createGame';

describe('createGame', () => {
  it('creates a lobby game with initial round and normalized rng state', () => {
    const state = createGame({
      id: 'game-test',
      seed: 123,
    });

    expect(state.id).toBe('game-test');
    expect(state.status).toBe('lobby');
    expect(state.hostPlayerId).toBeNull();
    expect(state.players).toEqual([]);
    expect(state.winnerPlayerId).toBeNull();
    expect(state.startedPlayerCount).toBe(0);
    expect(state.round.seed).toBe(123 >>> 0);
    expect(state.rngState).toBe(123 >>> 0);
  });

  it('replaces zero seed with fallback rng state', () => {
    const state = createGame({
      id: 'game-zero',
      seed: 0,
    });

    expect(state.round.seed).toBe(0);
    expect(state.rngState).toBe(0x9e3779b9);
  });

  it('uses provided config override', () => {
    const state = createGame({
      id: 'game-config',
      seed: 1,
      config: {
        mathProfileId: 'classic-high',
      },
    });

    expect(state.config.mathProfileId).toBe('classic-high');
  });
});
