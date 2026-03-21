import { PayoutCalculator } from "../engine/Payout";
import { RNG } from "../engine/RNG";
import { SlotEngine } from "../engine/SlotEngine";
import type { GameState } from "../game/GameState";
import type { PlayerState } from "../game/Player";
import type { RoundState, SpinResult } from "../game/Round";

function createBettingRound(state: GameState, now: number): RoundState {
  return {
    index: state.round.index + 1,
    status: "betting",
    startedAt: now,
    bettingClosesAt: now + state.config.bettingDurationMs,
    spinAt: null,
    seed: state.rngState,
    result: null,
  };
}

function sanitizeRoundBet(
  minBet: number,
  maxBet: number,
  player: PlayerState,
): number {
  const normalizedBet = Math.floor(player.currentBet);

  if (normalizedBet < minBet) {
    return 0;
  }

  const cappedBet = Math.min(normalizedBet, maxBet, player.balance);

  if (cappedBet < minBet) {
    return 0;
  }

  return cappedBet;
}

function buildSpinResult(state: GameState): {
  readonly result: SpinResult;
  readonly nextRngState: number;
} {
  const rng = new RNG(state.rngState);

  const slotEngine = new SlotEngine({
    rows: state.config.rows,
    reelStrips: state.config.reelStrips,
  });

  const payoutCalculator = new PayoutCalculator({
    paylines: state.config.paylines,
    paytable: state.config.paytable,
  });

  const grid = slotEngine.spin(rng);
  const payout = payoutCalculator.evaluate(grid);

  return {
    result: {
      grid,
      totalMultiplier: payout.totalMultiplier,
      winningLines: payout.winningLines,
    },
    nextRngState: rng.getState(),
  };
}

function resolveBalances(
  state: GameState,
  result: SpinResult,
): readonly PlayerState[] {
  return state.players.map((player) => {
    if (player.isEliminated === true) {
      return {
        ...player,
        currentBet: 0,
        lastWin: 0,
      };
    }

    const bet = sanitizeRoundBet(
      state.config.minBet,
      state.config.maxBet,
      player,
    );

    if (bet === 0) {
      return {
        ...player,
        currentBet: 0,
        lastWin: 0,
        isEliminated: player.balance < state.config.minBet,
      };
    }

    const winAmount = bet * result.totalMultiplier;
    const nextBalance = player.balance - bet + winAmount;

    return {
      ...player,
      balance: nextBalance,
      currentBet: 0,
      lastWin: winAmount,
      isEliminated: nextBalance < state.config.minBet,
    };
  });
}

function getAlivePlayers(
  players: readonly PlayerState[],
): readonly PlayerState[] {
  return players.filter((player) => player.isEliminated === false);
}

function getWinnerPlayerId(
  state: GameState,
  players: readonly PlayerState[],
): string | null {
  const targetWinner = players.find(
    (player) =>
      player.isEliminated === false &&
      player.balance >= state.config.targetBalance,
  );

  if (targetWinner !== undefined) {
    return targetWinner.id;
  }

  const alivePlayers = getAlivePlayers(players);

  if (state.startedPlayerCount > 1 && alivePlayers.length === 1) {
    return alivePlayers[0].id;
  }

  return null;
}

function shouldFinishGame(
  state: GameState,
  players: readonly PlayerState[],
): boolean {
  if (players.some((player) => player.balance >= state.config.targetBalance)) {
    return true;
  }

  const alivePlayers = getAlivePlayers(players);

  if (state.startedPlayerCount <= 1) {
    return alivePlayers.length === 0;
  }

  return alivePlayers.length <= 1;
}

function normalizeBetsForSpin(state: GameState): readonly PlayerState[] {
  return state.players.map((player) => {
    if (player.isEliminated === true) {
      return {
        ...player,
        currentBet: 0,
      };
    }

    return {
      ...player,
      currentBet:
        sanitizeRoundBet(state.config.minBet, state.config.maxBet, player) || 0,
    };
  });
}

function preparePlayersForNextRound(state: GameState): readonly PlayerState[] {
  return state.players.map((player) => {
    if (player.isEliminated === true) {
      return {
        ...player,
        currentBet: 0,
        lastWin: 0,
      };
    }

    return {
      ...player,
      currentBet: 0,
      lastWin: 0,
    };
  });
}

function haveAllActivePlayersPlacedBets(state: GameState): boolean {
  const activePlayers = state.players.filter(
    (player) => player.isConnected === true && player.isEliminated === false,
  );

  if (activePlayers.length === 0) {
    return false;
  }

  return activePlayers.every((player) => {
    const bet = sanitizeRoundBet(
      state.config.minBet,
      state.config.maxBet,
      player,
    );

    return bet > 0;
  });
}

export function tickGame(state: GameState, now: number): GameState {
  if (state.status !== "running") {
    return state;
  }

  switch (state.round.status) {
    case "idle": {
      return state;
    }

    case "betting": {
      const bettingClosesAt = state.round.bettingClosesAt;
      const shouldSpinNow =
        haveAllActivePlayersPlacedBets(state) ||
        bettingClosesAt === null ||
        now >= bettingClosesAt;

      if (shouldSpinNow === false) {
        return state;
      }

      return {
        ...state,
        players: normalizeBetsForSpin(state),
        round: {
          ...state.round,
          status: "spinning",
          spinAt: now,
          result: null,
          seed: state.rngState,
        },
      };
    }

    case "spinning": {
      const spinAt = state.round.spinAt;

      if (spinAt === null || now < spinAt + state.config.spinDurationMs) {
        return state;
      }

      const { result, nextRngState } = buildSpinResult(state);
      const nextPlayers = resolveBalances(state, result);
      const finished = shouldFinishGame(state, nextPlayers);
      const winnerPlayerId = finished
        ? getWinnerPlayerId(state, nextPlayers)
        : null;

      return {
        ...state,
        status: finished ? "finished" : "running",
        players: nextPlayers,
        rngState: nextRngState,
        winnerPlayerId,
        round: {
          ...state.round,
          status: "resolved",
          result,
        },
      };
    }

    case "resolved": {
      const alivePlayers = getAlivePlayers(state.players);

      if (state.startedPlayerCount > 1 && alivePlayers.length <= 1) {
        return {
          ...state,
          status: "finished",
          winnerPlayerId: alivePlayers[0]?.id ?? null,
        };
      }

      if (state.startedPlayerCount <= 1 && alivePlayers.length === 0) {
        return {
          ...state,
          status: "finished",
          winnerPlayerId: null,
        };
      }

      const nextPlayers = preparePlayersForNextRound(state);

      return {
        ...state,
        players: nextPlayers,
        round: createBettingRound(
          {
            ...state,
            players: nextPlayers,
          },
          now,
        ),
      };
    }

    default: {
      return state;
    }
  }
}
