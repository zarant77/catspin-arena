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
        {players.map((player) => {
          const isCurrentPlayer = player.id === playerId;
          const isHostPlayer = room.game.hostPlayerId === player.id;

          return (
            <li key={player.id} className="player" data-current={isCurrentPlayer} data-online={player.isConnected}>
              <div className="player-card">
                <div className="player-avatar">
                  <Avatar size="lg" value={player.avatar} mood={player.isReady ? 'lose' : 'neutral'} />
                  <span
                    className="status-dot"
                    data-state={player.isConnected ? 'connected' : 'disconnected'}
                    aria-label={player.isConnected ? 'online' : 'offline'}
                    title={player.isConnected ? 'Online' : 'Offline'}
                  />
                </div>

                <div className="player-content">
                  <div className="player-top">
                    <span className="player-name" title={player.name}>
                      {player.name}
                    </span>

                    {isCurrentPlayer ? <span className="badge player-you-badge">you</span> : null}
                  </div>

                  <div className="player-bottom">
                    <div className="player-meta">
                      {isHostPlayer ? <span className="badge player-host-badge">host</span> : null}
                    </div>

                    <div className="player-state">
                      <span
                        className={
                          player.isReady ? 'badge is-success player-ready-badge' : 'badge is-warning player-ready-badge'
                        }
                      >
                        {player.isReady ? 'ready' : 'not ready'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </Section>
  );
}
