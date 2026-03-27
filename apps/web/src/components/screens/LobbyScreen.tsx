import type { RoomDTO } from '@catspin/protocol';
import type { PlayerView } from '../../types/playerView';
import { Section } from '../layout/Section';
import { Avatar } from '../common/Avatar';

type LobbyScreenProps = {
  readonly room: RoomDTO;
  readonly playerId: string | null;
  readonly currentPlayer: PlayerView | null;
  readonly players: readonly PlayerView[];
  readonly isHost: boolean;
  readonly onToggleReady: () => void;
  readonly onStartGame: () => void;
  readonly onLeaveRoom: () => void;
};

export function LobbyScreen(props: LobbyScreenProps) {
  const { room, playerId, currentPlayer, players, isHost, onToggleReady, onStartGame, onLeaveRoom } = props;

  return (
    <Section
      title={`Room ${room.id}`}
      className="lobby"
      actions={
        <>
          <button type="button" onClick={onToggleReady} disabled={currentPlayer === null}>
            {currentPlayer?.isReady ? 'Unready' : 'Ready'}
          </button>

          {isHost ? (
            <button type="button" onClick={onStartGame}>
              Start
            </button>
          ) : null}

          <button type="button" onClick={onLeaveRoom}>
            Leave
          </button>
        </>
      }
    >
      <ul className="players">
        {players.map((player) => (
          <li key={player.id} className="player" data-current={player.id === playerId} data-online={player.isConnected}>
            <div className="player-row">
              <div className="player-left">
                <Avatar size="md" value={player.avatar} />
                <span className="player-name">{player.name}</span>

                {player.id === playerId ? <span className="badge">you</span> : null}

                {room.game.hostPlayerId === player.id ? <span className="badge">host</span> : null}
              </div>

              <div className="player-right">
                <span className={player.isReady ? 'badge is-success' : 'badge'}>
                  {player.isReady ? 'ready' : 'not ready'}
                </span>

                <span className="status-dot" data-state={player.isConnected ? 'connected' : 'disconnected'} />
              </div>
            </div>
          </li>
        ))}
      </ul>
    </Section>
  );
}
