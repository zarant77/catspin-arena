import { createPlayer, type PlayerId, type PlayerState } from "../game/Player";
import type { GameState } from "../game/GameState";
import type { RoundState } from "../game/Round";

export type GameCommand =
  | {
      readonly type: "add_player";
      readonly playerId: PlayerId;
      readonly name: string;
    }
  | {
      readonly type: "remove_player";
      readonly playerId: PlayerId;
    }
  | {
      readonly type: "set_ready";
      readonly playerId: PlayerId;
      readonly value: boolean;
    }
  | {
      readonly type: "set_bet";
      readonly playerId: PlayerId;
      readonly amount: number;
    }
  | {
      readonly type: "start_game";
      readonly playerId: PlayerId;
      readonly now: number;
    };

function replacePlayer(
  players: readonly PlayerState[],
  playerId: PlayerId,
  update: (player: PlayerState) => PlayerState,
): readonly PlayerState[] {
  return players.map((player) =>
    player.id === playerId ? update(player) : player,
  );
}

function canStartGame(state: GameState): boolean {
  if (state.status !== "lobby") {
    return false;
  }

  const connectedPlayers = state.players.filter(
    (player) => player.isConnected === true,
  );

  if (connectedPlayers.length === 0) {
    return false;
  }

  return connectedPlayers.every((player) => player.isReady === true);
}

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

function sanitizeBet(
  state: GameState,
  amount: number,
  balance: number,
): number {
  if (Number.isFinite(amount) === false) {
    return 0;
  }

  const normalizedAmount = Math.floor(amount);

  if (normalizedAmount < state.config.minBet) {
    return 0;
  }

  const cappedByConfig = Math.min(normalizedAmount, state.config.maxBet);
  const cappedByBalance = Math.min(cappedByConfig, balance);

  if (cappedByBalance < state.config.minBet) {
    return 0;
  }

  return cappedByBalance;
}

export function applyCommand(
  state: GameState,
  command: GameCommand,
): GameState {
  switch (command.type) {
    case "add_player": {
      if (state.status !== "lobby") {
        return state;
      }

      const alreadyExists = state.players.some(
        (player) => player.id === command.playerId,
      );

      if (alreadyExists === true) {
        return state;
      }

      const nextPlayer = createPlayer({
        id: command.playerId,
        name: command.name,
        startBalance: state.config.startBalance,
      });

      return {
        ...state,
        hostPlayerId: state.hostPlayerId ?? nextPlayer.id,
        players: [...state.players, nextPlayer],
      };
    }

    case "remove_player": {
      const nextPlayers = state.players.filter(
        (player) => player.id !== command.playerId,
      );

      if (nextPlayers.length === state.players.length) {
        return state;
      }

      const nextHostPlayerId =
        state.hostPlayerId === command.playerId
          ? (nextPlayers[0]?.id ?? null)
          : state.hostPlayerId;

      const nextWinnerPlayerId =
        state.winnerPlayerId === command.playerId ? null : state.winnerPlayerId;

      return {
        ...state,
        players: nextPlayers,
        hostPlayerId: nextHostPlayerId,
        winnerPlayerId: nextWinnerPlayerId,
      };
    }

    case "set_ready": {
      if (state.status !== "lobby") {
        return state;
      }

      const hasPlayer = state.players.some(
        (player) => player.id === command.playerId,
      );

      if (hasPlayer === false) {
        return state;
      }

      return {
        ...state,
        players: replacePlayer(state.players, command.playerId, (player) => ({
          ...player,
          isReady: command.value,
        })),
      };
    }

    case "set_bet": {
      const canEditBet =
        state.status === "lobby" ||
        (state.status === "running" && state.round.status === "betting");

      if (canEditBet === false) {
        return state;
      }

      const player = state.players.find((item) => item.id === command.playerId);

      if (player === undefined || player.isEliminated === true) {
        return state;
      }

      const nextBet = sanitizeBet(state, command.amount, player.balance);

      return {
        ...state,
        players: replacePlayer(state.players, command.playerId, (item) => ({
          ...item,
          currentBet: nextBet,
        })),
      };
    }

    case "start_game": {
      if (state.hostPlayerId !== command.playerId) {
        return state;
      }

      if (canStartGame(state) === false) {
        return state;
      }

      const nextPlayers = state.players.map((player) => ({
        ...player,
        isReady: false,
        currentBet: 0,
        lastWin: 0,
      }));

      const startedPlayerCount = nextPlayers.filter(
        (player) =>
          player.isConnected === true && player.isEliminated === false,
      ).length;

      return {
        ...state,
        status: "running",
        players: nextPlayers,
        startedPlayerCount,
        round: createBettingRound(
          {
            ...state,
            players: nextPlayers,
            startedPlayerCount,
          },
          command.now,
        ),
      };
    }

    default: {
      return state;
    }
  }
}
