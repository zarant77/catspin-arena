import type { ClientEvent, RoomDTO, ServerEvent } from '@catspin/protocol';
import { createSocket, type SocketClient, type SocketStatus } from './socket';

export type RealtimeClientOptions = {
  wsUrl: string;
  onRoomState: (room: RoomDTO) => void;
  onJoinedRoom: (payload: { room: RoomDTO; playerId: string }) => void;
  onLeftRoom: () => void;
  onError: (message: string) => void;
  onStatusChange: (status: SocketStatus) => void;
};

export type RealtimeClient = {
  connect: () => void;
  disconnect: () => void;
  joinRoom: (args: { roomId: string; name: string }) => void;
  leaveRoom: () => void;
  setReady: (ready: boolean) => void;
  setBet: (amount: number) => void;
  confirmBet: () => void;
  startGame: () => void;
};

const SESSION_ID_KEY = 'catspin.sessionId';
const PLAYER_ID_KEY = 'catspin.playerId';

export function createRealtimeClient(options: RealtimeClientOptions): RealtimeClient {
  const socket: SocketClient = createSocket(options.wsUrl);

  let sessionId = getOrCreateSessionId();
  let playerId = getOrCreatePlayerId();

  socket.subscribe((event: ServerEvent) => {
    switch (event.type) {
      case 'room_state':
        options.onRoomState(event.room);
        break;

      case 'joined_room':
        playerId = event.playerId;
        savePlayerId(playerId);

        options.onJoinedRoom({
          room: event.room,
          playerId: event.playerId,
        });
        break;

      case 'left_room':
        options.onLeftRoom();
        break;

      case 'error':
        options.onError(event.message);
        break;

      default:
        break;
    }
  });

  socket.onStatusChange(options.onStatusChange);

  const send = (event: ClientEvent): void => {
    socket.send(event);
  };

  return {
    connect: () => socket.connect(),
    disconnect: () => socket.disconnect(),

    joinRoom: ({ roomId, name }) => {
      const normalizedRoomId = roomId.trim();
      const normalizedName = name.trim();

      if (normalizedName.length === 0 || normalizedRoomId.length === 0) {
        return;
      }

      send({
        type: 'join_room',
        roomId: normalizedRoomId,
        name: normalizedName,
        playerId,
        sessionId,
      });
    },

    leaveRoom: () => {
      send({ type: 'leave_room' });
    },

    setReady: (ready: boolean) => {
      send({
        type: 'set_ready',
        playerId,
        value: ready,
      });
    },

    setBet: (amount: number) => {
      send({
        type: 'set_bet',
        playerId,
        amount,
      });
    },

    confirmBet: () => {
      send({
        type: 'confirm_bet',
        playerId,
      });
    },

    startGame: () => {
      send({
        type: 'start_game',
        playerId,
      });
    },
  };
}

function getOrCreateSessionId(): string {
  const existing = window.sessionStorage.getItem(SESSION_ID_KEY);

  if (existing !== null && existing.length > 0) {
    return existing;
  }

  const created = createId('session');
  window.sessionStorage.setItem(SESSION_ID_KEY, created);
  return created;
}

function getOrCreatePlayerId(): string {
  const existing = window.localStorage.getItem(PLAYER_ID_KEY);

  if (existing !== null && existing.length > 0) {
    return existing;
  }

  const created = createId('player');
  savePlayerId(created);
  return created;
}

function savePlayerId(value: string): void {
  window.localStorage.setItem(PLAYER_ID_KEY, value);
}

function createId(prefix: string): string {
  const browserCrypto = globalThis.crypto;

  if (typeof browserCrypto !== 'undefined' && typeof browserCrypto.randomUUID === 'function') {
    return `${prefix}-${browserCrypto.randomUUID()}`;
  }

  if (typeof browserCrypto !== 'undefined' && typeof browserCrypto.getRandomValues === 'function') {
    const bytes = new Uint8Array(16);
    browserCrypto.getRandomValues(bytes);

    const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');

    return `${prefix}-${hex}`;
  }

  const timestamp = Date.now().toString(16);
  const randomPart = Math.random().toString(16).slice(2);

  return `${prefix}-${timestamp}-${randomPart}`;
}
