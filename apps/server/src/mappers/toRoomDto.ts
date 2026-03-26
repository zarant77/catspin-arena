import type { PublicGameState } from '@catspin/core';
import type { GameStateDTO, RoomDTO } from '@catspin/protocol';

export function toGameStateDto(args: { game: PublicGameState; serverNow: number }): GameStateDTO {
  const { game, serverNow } = args;

  return {
    id: game.id,
    status: game.status,
    hostPlayerId: game.hostPlayerId,
    winnerPlayerId: game.winnerPlayerId,
    players: [...game.players],
    round: {
      index: game.round.index,
      status: game.round.status,
      startedAt: game.round.startedAt,
      bettingClosesAt: game.round.bettingClosesAt,
      spinAt: game.round.spinAt,
      result:
        game.round.result === null
          ? null
          : {
              grid: game.round.result.grid.map((column) => [...column]),
              totalMultiplier: game.round.result.totalMultiplier,
              winningLines: [...game.round.result.winningLines],
            },
      winnerPlayerIds: [...game.round.winnerPlayerIds],
      payoutAmount: game.round.payoutAmount,
    },
    config: {
      minBet: game.config.minBet,
      maxBet: game.config.maxBet,
      bettingDurationMs: game.config.bettingDurationMs,
      spinDurationMs: game.config.spinDurationMs,
      paylines: game.config.paylines.map((payline) => [...payline]),
      paylinePresentation: game.config.paylinePresentation,
    },
    serverNow,
  };
}

export function toRoomDto(args: { id: string; game: PublicGameState; serverNow: number }): RoomDTO {
  return {
    id: args.id,
    game: toGameStateDto({
      game: args.game,
      serverNow: args.serverNow,
    }),
  };
}
