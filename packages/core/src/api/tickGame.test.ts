import { describe, expect, it } from 'vitest';
import { applyCommand } from './applyCommand';
import { createGame } from './createGame';
import { tickGame } from './tickGame';

function createStartedGame() {
  let state = createGame({
    id: 'game-tick',
    seed: 123,
  });

  state = applyCommand(state, {
    type: 'add_player',
    playerId: 'p1',
    name: 'Host',
    avatar: 'host-avatar',
  });

  state = applyCommand(state, {
    type: 'add_player',
    playerId: 'p2',
    name: 'Guest',
    avatar: 'guest-avatar',
  });

  state = applyCommand(state, {
    type: 'set_ready',
    playerId: 'p1',
    value: true,
  });

  state = applyCommand(state, {
    type: 'set_ready',
    playerId: 'p2',
    value: true,
  });

  state = applyCommand(state, {
    type: 'start_game',
    playerId: 'p1',
    now: 1000,
  });

  return state;
}

describe('tickGame', () => {
  it('keeps presenting phase before presenting timeout', () => {
    const state = createStartedGame();

    const next = tickGame(state, 1000);

    expect(next.round.status).toBe('presenting');
  });

  it('moves from presenting to betting after enough time', () => {
    const state = createStartedGame();

    const next = tickGame(state, 1_000_000);

    expect(next.status).toBe('running');
    expect(next.round.status).toBe('betting');
    expect(next.round.startedAt).toBe(1_000_000);
    expect(next.round.bettingClosesAt).toBeGreaterThan(1_000_000);
  });

  it('moves from betting to spinning when all active players confirmed bets', () => {
    let state = createStartedGame();

    state = tickGame(state, 1_000_000);

    state = applyCommand(state, {
      type: 'set_bet',
      playerId: 'p1',
      amount: state.config.minBet,
    });

    state = applyCommand(state, {
      type: 'set_bet',
      playerId: 'p2',
      amount: state.config.minBet,
    });

    state = applyCommand(state, {
      type: 'confirm_bet',
      playerId: 'p1',
    });

    state = applyCommand(state, {
      type: 'confirm_bet',
      playerId: 'p2',
    });

    const next = tickGame(state, 1_000_001);

    expect(next.round.status).toBe('spinning');
    expect(next.round.spinAt).toBe(1_000_001);
  });

  it('moves from spinning to resolved after spin duration', () => {
    let state = createStartedGame();

    state = tickGame(state, 1_000_000);

    state = applyCommand(state, {
      type: 'set_bet',
      playerId: 'p1',
      amount: state.config.minBet,
    });

    state = applyCommand(state, {
      type: 'set_bet',
      playerId: 'p2',
      amount: state.config.minBet,
    });

    state = applyCommand(state, {
      type: 'confirm_bet',
      playerId: 'p1',
    });

    state = applyCommand(state, {
      type: 'confirm_bet',
      playerId: 'p2',
    });

    state = tickGame(state, 1_000_001);

    const resolved = tickGame(state, 2_000_000);

    expect(['resolved', 'finished']).toContain(resolved.round.status);
    expect(resolved.round.result).not.toBeNull();
    expect(resolved.round.spinAt).toBeNull();
  });

  it('returns unchanged state when game is not running', () => {
    const state = createGame({
      id: 'game-idle',
      seed: 7,
    });

    const next = tickGame(state, 1000);

    expect(next).toEqual(state);
  });
});
