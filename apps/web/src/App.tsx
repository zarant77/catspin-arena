import { useEffect, useMemo, useRef, useState } from 'react';
import type { RoomDTO } from '@catspin/protocol';
import { initAudio, unlockAudio } from './audio';
import { useClientStore, useClientStoreState } from './state/storeContext';
import { clearRoomIdHash, getRoomIdFromHash, setRoomIdHash } from './utils/roomHash';
import type { PlayerView } from './types/playerView';
import { NameScreen } from './components/screens/NameScreen';
import { RoomSetupScreen } from './components/screens/RoomSetupScreen';
import { LobbyScreen } from './components/screens/LobbyScreen';
import { GameScreen } from './components/screens/game/GameScreen';
import { WinScreen } from './components/screens/WinScreen';
import { Header } from './components/layout/Header';

import './styles/index.css';

type Screen = 'room_setup' | 'lobby' | 'game';

function getPlayers(room: RoomDTO | null): readonly PlayerView[] {
  return room?.game.players ?? [];
}

function getCurrentPlayer(room: RoomDTO | null, playerId: string | null): PlayerView | null {
  if (room === null || playerId === null) {
    return null;
  }

  return room.game.players.find((player) => player.id === playerId) ?? null;
}

function getScreen(playerName: string | null, room: RoomDTO | null): Screen {
  if (room === null) {
    return 'room_setup';
  }

  if (room.game.status === 'lobby') {
    return 'lobby';
  }

  return 'game';
}

export default function App() {
  const store = useClientStore();
  const state = useClientStoreState();

  const [roomInput, setRoomInput] = useState<string>(() => getRoomIdFromHash() ?? '');
  const [isNameScreenOpen, setIsNameScreenOpen] = useState<boolean>(() => {
    return (state.playerName?.trim().length ?? 0) === 0;
  });

  const autoJoinAttemptedRef = useRef(false);

  const players = useMemo(() => getPlayers(state.room), [state.room]);

  const currentPlayer = useMemo(() => {
    return getCurrentPlayer(state.room, state.playerId);
  }, [state.room, state.playerId]);

  const screen = useMemo(() => {
    return getScreen(state.playerName, state.room);
  }, [state.playerName, state.room]);

  const isHost = state.room !== null && state.playerId !== null && state.room.game.hostPlayerId === state.playerId;

  const trimmedPlayerName = state.playerName?.trim() ?? '';
  const canCreate = trimmedPlayerName.length > 0;
  const canJoin = trimmedPlayerName.length > 0 && roomInput.trim().length > 0;

  useEffect(() => {
    if (trimmedPlayerName.length === 0) {
      setIsNameScreenOpen(true);
    }
  }, [trimmedPlayerName]);

  useEffect(() => {
    const handleHashChange = (): void => {
      const roomIdFromHash = getRoomIdFromHash() ?? '';
      setRoomInput(roomIdFromHash);
      autoJoinAttemptedRef.current = false;
    };

    window.addEventListener('hashchange', handleHashChange);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  useEffect(() => {
    const roomIdFromHash = getRoomIdFromHash();
    const name = state.playerName;
    const avatar = state.playerAvatar;

    if (!roomIdFromHash) return;
    if (name.length === 0) return;
    if (isNameScreenOpen) return;
    if (state.connectionStatus !== 'connected') return;
    if (state.room !== null) return;
    if (autoJoinAttemptedRef.current) return;

    autoJoinAttemptedRef.current = true;

    store.joinRoom({
      roomId: roomIdFromHash,
      name,
      avatar,
    });
  }, [state.connectionStatus, state.playerName, state.room, isNameScreenOpen, store]);

  useEffect(() => {
    if (state.room !== null) {
      setRoomIdHash(state.room.id);
      setRoomInput(state.room.id);
    }
  }, [state.room]);

  useEffect(() => {
    initAudio();

    const unlock = () => {
      unlockAudio();
      window.removeEventListener('pointerdown', unlock);
    };

    window.addEventListener('pointerdown', unlock, { once: true });

    return () => {
      window.removeEventListener('pointerdown', unlock);
    };
  }, []);

  const handleOpenNameScreen = (): void => {
    setIsNameScreenOpen(true);
    autoJoinAttemptedRef.current = false;
  };

  const handleCloseNameScreen = (): void => {
    if (!state.playerName.length) {
      return;
    }

    setIsNameScreenOpen(false);
  };

  const handleCreateRoom = async (): Promise<void> => {
    const name = state.playerName;
    const avatar = state.playerAvatar;

    if (name.length === 0) return;

    try {
      const roomId = await store.createRoom();
      setRoomIdHash(roomId);
      setRoomInput(roomId);

      autoJoinAttemptedRef.current = true;

      store.joinRoom({
        roomId,
        name,
        avatar,
      });
    } catch (error) {
      console.error('Failed to create room', error);
    }
  };

  const handleJoinRoom = (): void => {
    const roomId = roomInput.trim();
    const name = state.playerName;
    const avatar = state.playerAvatar;

    if (roomId.length === 0 || name.length === 0) return;

    setRoomIdHash(roomId);
    autoJoinAttemptedRef.current = true;

    store.joinRoom({
      roomId,
      name,
      avatar,
    });
  };

  const handleLeaveRoom = (): void => {
    autoJoinAttemptedRef.current = true;
    store.leaveRoom();

    setTimeout(() => {
      clearRoomIdHash();
      setRoomInput('');
    }, 100);
  };

  return (
    <div className="app">
      <div className="shell">
        <Header connectionStatus={state.connectionStatus} onChangeName={handleOpenNameScreen} />

        {state.error !== null ? (
          <div className="section">
            <div className="badge danger">{state.error}</div>
          </div>
        ) : null}

        <main className="stack">
          <NameScreen isOpen={isNameScreenOpen} onClose={handleCloseNameScreen} />

          {!isNameScreenOpen && screen === 'room_setup' && (
            <RoomSetupScreen
              roomInput={roomInput}
              onRoomInputChange={(value) => {
                setRoomInput(value);
                autoJoinAttemptedRef.current = false;
              }}
              onCreateRoom={handleCreateRoom}
              onJoinRoom={handleJoinRoom}
              canCreate={canCreate}
              canJoin={canJoin}
            />
          )}

          {!isNameScreenOpen && screen === 'lobby' && state.room !== null && (
            <LobbyScreen
              room={state.room}
              playerId={state.playerId}
              currentPlayer={currentPlayer}
              players={players}
              isHost={isHost}
              onToggleReady={() => store.setReady(!(currentPlayer?.isReady ?? false))}
              onStartGame={() => store.startGame()}
              onLeaveRoom={handleLeaveRoom}
            />
          )}

          {!isNameScreenOpen && screen === 'game' && state.room !== null && (
            <GameScreen
              room={state.room}
              playerId={state.playerId}
              currentPlayer={currentPlayer}
              serverTimeOffsetMs={state.serverTimeOffsetMs}
              onSetBet={(bet) => store.setBet(bet)}
              onLeaveRoom={handleLeaveRoom}
            />
          )}
        </main>
      </div>

      <WinScreen room={state.room} playerId={state.playerId} onLeaveRoom={handleLeaveRoom} />
    </div>
  );
}
