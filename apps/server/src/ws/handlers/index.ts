import type { WebSocket } from 'ws';

import type { ClientEvent, ServerEvent } from '@catspin/protocol';

import type { Room } from '../../rooms/Room';
import type { RoomManager } from '../../rooms/RoomManager';
import { toRoomDto, toGameStateDto } from '../../mappers/toRoomDto';

type ConnectionContext = {
  socket: WebSocket;
  roomManager: RoomManager;
  currentRoom: Room | null;
  currentPlayerId: string | null;
  unsubscribe: (() => void) | null;
};

function send(socket: WebSocket, event: ServerEvent): void {
  socket.send(JSON.stringify(event));
}

function subscribeToRoom(context: ConnectionContext, room: Room): void {
  if (context.unsubscribe !== null) {
    context.unsubscribe();
    context.unsubscribe = null;
  }

  context.unsubscribe = room.subscribe((snapshot) => {
    const event: ServerEvent = {
      type: 'room_state',
      room: {
        id: snapshot.id,
        game: toGameStateDto({
          game: snapshot.game,
          serverNow: Date.now(),
        }),
      },
    };

    send(context.socket, event);
  });
}

function cleanupConnection(context: ConnectionContext): void {
  if (context.currentRoom !== null && context.currentPlayerId !== null) {
    context.currentRoom.disconnectPlayer(context.currentPlayerId);
  }

  if (context.unsubscribe !== null) {
    context.unsubscribe();
    context.unsubscribe = null;
  }

  context.currentRoom = null;
  context.currentPlayerId = null;
}

function handleJoin(context: ConnectionContext, event: Extract<ClientEvent, { type: 'join_room' }>): void {
  const room = context.roomManager.getRoom(event.roomId);

  if (room === null) {
    send(context.socket, {
      type: 'error',
      message: 'Room not found',
    });
    return;
  }

  const publicState = room.getPublicState();
  const isExistingPlayer = room.hasPlayer(event.playerId);

  if (publicState.status !== 'lobby' && isExistingPlayer === false) {
    send(context.socket, {
      type: 'error',
      message: 'Game already started',
    });
    return;
  }

  context.currentRoom = room;
  context.currentPlayerId = event.playerId;

  room.joinPlayer({
    sessionId: event.sessionId,
    playerId: event.playerId,
    name: event.name,
  });

  subscribeToRoom(context, room);

  send(context.socket, {
    type: 'joined_room',
    room: toRoomDto({
      id: room.id,
      game: room.getPublicState(),
      serverNow: Date.now(),
    }),
    playerId: event.playerId,
  });
}

function handleLeave(context: ConnectionContext): void {
  const room = context.currentRoom;
  const playerId = context.currentPlayerId;

  if (room === null || playerId === null) {
    return;
  }

  room.disconnectPlayer(playerId);
  room.removePlayer(playerId);

  if (context.unsubscribe !== null) {
    context.unsubscribe();
    context.unsubscribe = null;
  }

  context.currentRoom = null;
  context.currentPlayerId = null;

  send(context.socket, {
    type: 'left_room',
  });
}

function handleReady(context: ConnectionContext, event: Extract<ClientEvent, { type: 'set_ready' }>): void {
  if (context.currentRoom === null || context.currentPlayerId === null) {
    return;
  }

  if (event.playerId !== context.currentPlayerId) {
    send(context.socket, {
      type: 'error',
      message: 'Player mismatch',
    });
    return;
  }

  context.currentRoom.setReady(event.playerId, event.value);
}

function handleBet(context: ConnectionContext, event: Extract<ClientEvent, { type: 'set_bet' }>): void {
  if (context.currentRoom === null || context.currentPlayerId === null) {
    return;
  }

  if (event.playerId !== context.currentPlayerId) {
    send(context.socket, {
      type: 'error',
      message: 'Player mismatch',
    });
    return;
  }

  context.currentRoom.setBet(event.playerId, event.amount);
}

function handleConfirmBet(context: ConnectionContext, event: Extract<ClientEvent, { type: 'confirm_bet' }>): void {
  if (context.currentRoom === null || context.currentPlayerId === null) {
    return;
  }

  if (event.playerId !== context.currentPlayerId) {
    send(context.socket, {
      type: 'error',
      message: 'Player mismatch',
    });
    return;
  }

  context.currentRoom.confirmBet(event.playerId);
}

function handleStart(context: ConnectionContext, event: Extract<ClientEvent, { type: 'start_game' }>): void {
  if (context.currentRoom === null || context.currentPlayerId === null) {
    return;
  }

  if (event.playerId !== context.currentPlayerId) {
    send(context.socket, {
      type: 'error',
      message: 'Player mismatch',
    });
    return;
  }

  context.currentRoom.startGame(event.playerId, Date.now());
}

function isClientEvent(value: unknown): value is ClientEvent {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const event = value as Record<string, unknown>;

  if (typeof event.type !== 'string') {
    return false;
  }

  switch (event.type) {
    case 'join_room':
      return (
        typeof event.roomId === 'string' &&
        event.roomId.length > 0 &&
        typeof event.sessionId === 'string' &&
        event.sessionId.length > 0 &&
        typeof event.playerId === 'string' &&
        event.playerId.length > 0 &&
        typeof event.name === 'string' &&
        event.name.length > 0
      );

    case 'leave_room':
      return true;

    case 'set_ready':
      return typeof event.playerId === 'string' && event.playerId.length > 0 && typeof event.value === 'boolean';

    case 'set_bet':
      return (
        typeof event.playerId === 'string' &&
        event.playerId.length > 0 &&
        typeof event.amount === 'number' &&
        Number.isFinite(event.amount)
      );

    case 'confirm_bet':
      return typeof event.playerId === 'string' && event.playerId.length > 0;

    case 'start_game':
      return typeof event.playerId === 'string' && event.playerId.length > 0;

    default:
      return false;
  }
}

export function registerSocketHandlers(socket: WebSocket, roomManager: RoomManager): void {
  const context: ConnectionContext = {
    socket,
    roomManager,
    currentRoom: null,
    currentPlayerId: null,
    unsubscribe: null,
  };

  socket.on('message', (raw) => {
    try {
      const text = typeof raw === 'string' ? raw : raw.toString('utf8');
      const json: unknown = JSON.parse(text);

      if (!isClientEvent(json)) {
        send(socket, {
          type: 'error',
          message: 'Invalid client event',
        });
        return;
      }

      const event = json;

      switch (event.type) {
        case 'join_room':
          handleJoin(context, event);
          break;

        case 'leave_room':
          handleLeave(context);
          break;

        case 'set_ready':
          handleReady(context, event);
          break;

        case 'set_bet':
          handleBet(context, event);
          break;

        case 'confirm_bet':
          handleConfirmBet(context, event);
          break;

        case 'start_game':
          handleStart(context, event);
          break;

        default:
          send(socket, {
            type: 'error',
            message: 'Unsupported event',
          });
          break;
      }
    } catch {
      send(socket, {
        type: 'error',
        message: 'Malformed message',
      });
    }
  });

  socket.on('close', () => {
    cleanupConnection(context);
  });

  socket.on('error', () => {
    cleanupConnection(context);
  });
}
