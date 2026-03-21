import type { RoomDTO } from "@catspin/protocol";
import { createRoom as createRoomRequest } from "../api/rooms";
import { createRealtimeClient, type RealtimeClient } from "../network/client";
import type { SocketStatus } from "../network/socket";
import { getStoredPlayerName, savePlayerName } from "../utils/playerName";

export type FooterState = {
  primaryText: string;
  secondaryText?: string;
};

export type ClientStoreState = {
  connectionStatus: SocketStatus;
  roomId: string | null;
  playerId: string | null;
  playerName: string;
  room: RoomDTO | null;
  error: string | null;
  footer: FooterState;
};

export type ClientStore = {
  getState: () => ClientStoreState;
  subscribe: (listener: () => void) => () => void;
  connect: () => void;
  disconnect: () => void;
  setPlayerName: (name: string) => void;
  createRoom: () => Promise<string>;
  joinRoom: (args: { roomId: string; name: string }) => void;
  leaveRoom: () => void;
  setReady: (ready: boolean) => void;
  setBet: (amount: number) => void;
  startGame: () => void;
  setFooter: (primaryText: string, secondaryText?: string) => void;
  clearFooter: () => void;
};

export type CreateClientStoreOptions = {
  apiBaseUrl: string;
  wsUrl: string;
};

const EMPTY_FOOTER: FooterState = {
  primaryText: "",
  secondaryText: undefined,
};

export function createClientStore(
  options: CreateClientStoreOptions,
): ClientStore {
  let state: ClientStoreState = {
    connectionStatus: "idle",
    roomId: null,
    playerId: null,
    playerName: getStoredPlayerName(),
    room: null,
    error: null,
    footer: EMPTY_FOOTER,
  };

  const listeners = new Set<() => void>();

  const setState = (patch: Partial<ClientStoreState>): void => {
    state = {
      ...state,
      ...patch,
    };

    listeners.forEach((listener) => listener());
  };

  const client: RealtimeClient = createRealtimeClient({
    wsUrl: options.wsUrl,

    onRoomState: (room) => {
      setState({
        room,
        roomId: room.id,
        error: null,
      });
    },

    onJoinedRoom: ({ room, playerId }) => {
      setState({
        room,
        roomId: room.id,
        playerId,
        error: null,
      });
    },

    onLeftRoom: () => {
      setState({
        room: null,
        roomId: null,
        playerId: null,
        error: null,
        footer: EMPTY_FOOTER,
      });
    },

    onError: (message) => {
      setState({
        error: message,
      });
    },

    onStatusChange: (connectionStatus) => {
      setState({ connectionStatus });
    },
  });

  return {
    getState: () => state,

    subscribe: (listener) => {
      listeners.add(listener);

      return () => {
        listeners.delete(listener);
      };
    },

    connect: () => {
      client.connect();
    },

    disconnect: () => {
      client.disconnect();
    },

    setPlayerName: (name: string) => {
      const normalized = name.trim();

      savePlayerName(normalized);

      setState({
        playerName: normalized,
      });
    },

    createRoom: async () => {
      const result = await createRoomRequest();

      setState({
        roomId: result.roomId,
        error: null,
      });

      return result.roomId;
    },

    joinRoom: ({ roomId, name }) => {
      setState({
        roomId,
        playerName: name,
        error: null,
      });

      client.joinRoom({ roomId, name });
    },

    leaveRoom: () => {
      setState({
        footer: EMPTY_FOOTER,
      });

      client.leaveRoom();
    },

    setReady: (ready) => {
      client.setReady(ready);
    },

    setBet: (amount) => {
      client.setBet(amount);
    },

    startGame: () => {
      client.startGame();
    },

    setFooter: (primaryText, secondaryText) => {
      setState({
        footer: {
          primaryText,
          secondaryText,
        },
      });
    },

    clearFooter: () => {
      setState({
        footer: EMPTY_FOOTER,
      });
    },
  };
}
