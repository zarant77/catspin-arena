import { describe, expect, it } from 'vitest';
import { applyCommand } from './applyCommand';
import { createGame } from './createGame';

describe('applyCommand', () => {
  it('adds a player and assigns host', () => {
    const state = createGame({
      id: 'game-test',
      seed: 1,
    });

    const next = applyCommand(state, {
      type: 'add_player',
      playerId: 'p1',
      name: 'Anton',
      avatar: 'cat-1',
    });

    expect(next.players).toHaveLength(1);
    expect(next.players[0]?.id).toBe('p1');
    expect(next.players[0]?.name).toBe('Anton');
    expect(next.players[0]?.avatar).toBe('cat-1');
    expect(next.hostPlayerId).toBe('p1');
  });

  it('marks player as ready in lobby', () => {
    let state = createGame({
      id: 'game-test',
      seed: 1,
    });

    state = applyCommand(state, {
      type: 'add_player',
      playerId: 'p1',
      name: 'Anton',
      avatar: 'cat-1',
    });

    state = applyCommand(state, {
      type: 'set_ready',
      playerId: 'p1',
      value: true,
    });

    expect(state.players[0]?.isReady).toBe(true);
  });

  it('stores bet in lobby as currentBet and lastBet', () => {
    let state = createGame({
      id: 'game-test',
      seed: 1,
    });

    state = applyCommand(state, {
      type: 'add_player',
      playerId: 'p1',
      name: 'Anton',
      avatar: 'cat-1',
    });

    state = applyCommand(state, {
      type: 'set_bet',
      playerId: 'p1',
      amount: 50,
    });

    const player = state.players[0];

    expect(player?.currentBet).toBe(state.config.maxBet);
    expect(player?.lastBet).toBe(state.config.maxBet);
    expect(player?.hasConfirmedBet).toBe(false);
  });

  it('starts game only when host starts and all connected players are ready', () => {
    let state = createGame({
      id: 'game-start',
      seed: 10,
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

    expect(state.status).toBe('running');
    expect(state.round.status).toBe('presenting');
    expect(state.round.presentingAt).toBe(1000);
    expect(state.startedPlayerCount).toBe(2);
    expect(state.players.every((player) => player.isReady === false)).toBe(true);
    expect(state.players.every((player) => player.currentBet === 0)).toBe(true);
  });

  it('does not start game for non-host', () => {
    let state = createGame({
      id: 'game-start',
      seed: 10,
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

    const next = applyCommand(state, {
      type: 'start_game',
      playerId: 'p2',
      now: 1000,
    });

    expect(next.status).toBe('lobby');
    expect(next.round.status).toBe('idle');
  });

  it('reassigns host when current host is removed', () => {
    let state = createGame({
      id: 'game-remove',
      seed: 1,
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
      type: 'remove_player',
      playerId: 'p1',
    });

    expect(state.players).toHaveLength(1);
    expect(state.players[0]?.id).toBe('p2');
    expect(state.hostPlayerId).toBe('p2');
  });
});
