import { applyCommand, createGame, getPublicState, tickGame } from '@catspin/core';

const PLAYER_ID = 'p1';

let state = createGame({
  id: 'slot-demo',
  seed: 123,
  config: {
    targetBalance: 1000_000_000,
    startBalance: 500,
    minBet: 1,
    maxBet: 100,
    bettingDurationMs: 1000_000_000,
    spinDurationMs: 2_000,
  },
});

state = applyCommand(state, {
  type: 'add_player',
  playerId: PLAYER_ID,
  name: 'Player',
  avatar: 'cat',
});

state = applyCommand(state, {
  type: 'set_ready',
  playerId: PLAYER_ID,
  value: true,
});

state = applyCommand(state, {
  type: 'start_game',
  playerId: PLAYER_ID,
  now: performance.now(),
});

export function spin(amount = 1): void {
  state = applyCommand(state, {
    type: 'set_bet',
    playerId: PLAYER_ID,
    amount,
  });

  state = applyCommand(state, {
    type: 'confirm_bet',
    playerId: PLAYER_ID,
  });
}

export function tick(): void {
  state = tickGame(state, performance.now());
}

export function getView() {
  return getPublicState(state);
}
