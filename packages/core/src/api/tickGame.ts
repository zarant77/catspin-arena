import { PayoutCalculator } from '../engine/Payout';
import { RNG } from '../engine/RNG';
import { SlotEngine } from '../engine/SlotEngine';
import type { GameState } from '../game/GameState';
import type { PlayerState } from '../game/Player';
import type { RoundState, SpinResult } from '../game/Round';
import type { PaylinePresentationConfig } from '../game/Rules';

function getPaylineSequenceDuration(linesCount: number, config: PaylinePresentationConfig): number {
  if (linesCount <= 0) {
    return 0;
  }

  return linesCount * config.lineDurationMs + Math.max(0, linesCount - 1) * config.lineGapMs + config.hideDelayMs;
}

function getPresentingDurationMs(state: GameState): number {
  return getPaylineSequenceDuration(state.config.math.paylines.length, state.config.paylinePresentation);
}

function getResolvedDurationMs(state: GameState): number {
  const winningLinesCount = state.round.result?.winningLines.length ?? 0;

  return getPaylineSequenceDuration(winningLinesCount, state.config.paylinePresentation);
}

function createBettingRound(state: GameState, now: number, index: number): RoundState {
  return {
    index,
    status: 'betting',
    startedAt: now,
    presentingAt: null,
    bettingClosesAt: now + state.config.bettingDurationMs,
    spinAt: null,
    resolvedAt: 0,
    seed: state.rngState,
    result: null,
    winnerPlayerIds: [],
    payoutAmount: 0,
  };
}

function createBettingPhaseForCurrentRound(state: GameState, now: number): RoundState {
  return createBettingRound(state, now, state.round.index);
}

function createNextBettingRound(state: GameState, now: number): RoundState {
  return createBettingRound(state, now, state.round.index + 1);
}

function sanitizeRoundBet(minBet: number, maxBet: number, player: PlayerState): number {
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

function resolveAutoBet(state: GameState, player: PlayerState): number {
  const policy = state.config.roundRules.missedBetPolicy;

  if (policy === 'repeat-last' && player.lastBet !== null) {
    const repeatedBet = Math.min(player.lastBet, state.config.maxBet, player.balance);

    return repeatedBet >= state.config.minBet ? repeatedBet : 0;
  }

  const minBet = Math.min(state.config.minBet, state.config.maxBet, player.balance);

  return minBet >= state.config.minBet ? minBet : 0;
}

function buildSpinResult(state: GameState): {
  readonly result: SpinResult;
  readonly nextRngState: number;
} {
  const rng = new RNG(state.rngState);

  const slotEngine = new SlotEngine({
    rows: state.config.rows,
    math: state.config.math,
  });

  const payoutCalculator = new PayoutCalculator({
    paylines: state.config.math.paylines,
    paytable: state.config.math.paytable,
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

function resolveRoundOutcome(
  state: GameState,
  result: SpinResult,
): {
  readonly players: readonly PlayerState[];
  readonly winnerPlayerIds: readonly string[];
  readonly payoutAmount: number;
} {
  const sanitizedPlayers = state.players.map((player) => ({
    player,
    bet: player.isEliminated === true ? 0 : sanitizeRoundBet(state.config.minBet, state.config.maxBet, player),
  }));

  const highestBet = sanitizedPlayers.reduce((max, entry) => Math.max(max, entry.bet), 0);

  const winnerPlayerIds =
    highestBet > 0
      ? sanitizedPlayers
          .filter((entry) => entry.bet === highestBet)
          .map((entry) => entry.player.id)
          .sort((left, right) => left.localeCompare(right))
      : [];

  const payoutAmount =
    state.config.roundRules.payoutBasePolicy === 'highest-bet' ? highestBet * result.totalMultiplier : 0;

  const winnersCount = winnerPlayerIds.length;
  const baseShare = winnersCount > 0 && payoutAmount > 0 ? Math.floor(payoutAmount / winnersCount) : 0;
  const remainder = winnersCount > 0 && payoutAmount > 0 ? payoutAmount % winnersCount : 0;

  const nextPlayers = state.players.map((player) => {
    if (player.isEliminated === true) {
      return {
        ...player,
        currentBet: 0,
        lastWin: 0,
      };
    }

    const bet = sanitizedPlayers.find((entry) => entry.player.id === player.id)?.bet ?? 0;
    const winnerIndex = winnerPlayerIds.indexOf(player.id);
    const extraChip = winnerIndex >= 0 && winnerIndex < remainder ? 1 : 0;
    const winAmount = winnerIndex >= 0 ? baseShare + extraChip : 0;
    const nextBalance = player.balance - bet + winAmount;

    return {
      ...player,
      balance: nextBalance,
      currentBet: 0,
      lastWin: winAmount,
      isEliminated: nextBalance < state.config.minBet,
    };
  });

  return {
    players: nextPlayers,
    winnerPlayerIds,
    payoutAmount,
  };
}

function getAlivePlayers(players: readonly PlayerState[]): readonly PlayerState[] {
  return players.filter((player) => player.isEliminated === false);
}

function getWinnerPlayerId(state: GameState, players: readonly PlayerState[]): string | null {
  const targetWinner = players.find(
    (player) => player.isEliminated === false && player.balance >= state.config.targetBalance,
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

function shouldFinishGame(state: GameState, players: readonly PlayerState[]): boolean {
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

    const sanitizedBet = sanitizeRoundBet(state.config.minBet, state.config.maxBet, player);

    if (sanitizedBet > 0) {
      return {
        ...player,
        currentBet: sanitizedBet,
      };
    }

    const autoBet = resolveAutoBet(state, player);

    return {
      ...player,
      currentBet: autoBet,
      lastBet: autoBet > 0 ? autoBet : player.lastBet,
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

    const canAffordMinBet = player.balance >= state.config.minBet;

    return {
      ...player,
      currentBet: 0,
      lastWin: 0,
      isEliminated: canAffordMinBet ? false : true,
    };
  });
}

function haveAllActivePlayersPlacedBets(state: GameState): boolean {
  const activePlayers = state.players.filter((player) => player.isConnected === true && player.isEliminated === false);

  if (activePlayers.length === 0) {
    return false;
  }

  return activePlayers.every((player) => {
    const bet = sanitizeRoundBet(state.config.minBet, state.config.maxBet, player);

    return bet > 0;
  });
}

export function tickGame(state: GameState, now: number): GameState {
  if (state.status !== 'running') {
    return state;
  }

  switch (state.round.status) {
    case 'idle': {
      return state;
    }

    case 'presenting': {
      const presentingAt = state.round.presentingAt;
      const presentingDurationMs = getPresentingDurationMs(state);

      if (presentingAt === null || now < presentingAt + presentingDurationMs) {
        return state;
      }

      return {
        ...state,
        round: createBettingPhaseForCurrentRound(state, now),
      };
    }

    case 'betting': {
      const bettingClosesAt = state.round.bettingClosesAt;
      const shouldSpinNow = haveAllActivePlayersPlacedBets(state) || bettingClosesAt === null || now >= bettingClosesAt;

      if (shouldSpinNow === false) {
        return state;
      }

      return {
        ...state,
        players: normalizeBetsForSpin(state),
        round: {
          ...state.round,
          status: 'spinning',
          presentingAt: null,
          spinAt: now,
          result: null,
          seed: state.rngState,
          winnerPlayerIds: [],
          payoutAmount: 0,
        },
      };
    }

    case 'spinning': {
      const spinAt = state.round.spinAt;

      if (spinAt === null || now < spinAt + state.config.spinDurationMs) {
        return state;
      }

      const { result, nextRngState } = buildSpinResult(state);
      const outcome = resolveRoundOutcome(state, result);
      const finished = shouldFinishGame(state, outcome.players);
      const winnerPlayerId = finished ? getWinnerPlayerId(state, outcome.players) : null;

      return {
        ...state,
        status: finished ? 'finished' : 'running',
        players: outcome.players,
        rngState: nextRngState,
        winnerPlayerId,
        round: {
          ...state.round,
          status: 'resolved',
          presentingAt: null,
          bettingClosesAt: null,
          spinAt: null,
          resolvedAt: now,
          result,
          winnerPlayerIds: outcome.winnerPlayerIds,
          payoutAmount: outcome.payoutAmount,
        },
      };
    }

    case 'resolved': {
      const resolvedAt = state.round.resolvedAt;
      const resolvedDurationMs = getResolvedDurationMs(state);

      if (now < resolvedAt + resolvedDurationMs) {
        return state;
      }

      const nextPlayers = preparePlayersForNextRound(state);
      const alivePlayers = getAlivePlayers(nextPlayers);

      if (state.startedPlayerCount > 1 && alivePlayers.length <= 1) {
        return {
          ...state,
          status: 'finished',
          players: nextPlayers,
          winnerPlayerId: alivePlayers[0]?.id ?? null,
        };
      }

      if (state.startedPlayerCount <= 1 && alivePlayers.length === 0) {
        return {
          ...state,
          status: 'finished',
          players: nextPlayers,
          winnerPlayerId: null,
        };
      }

      return {
        ...state,
        players: nextPlayers,
        round: createNextBettingRound(
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
