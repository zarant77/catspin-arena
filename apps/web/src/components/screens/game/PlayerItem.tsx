import type { PlayerView } from '../../../types/playerView';
import { Avatar } from '../../common/Avatar';

type PlayerItemProps = {
  readonly player: PlayerView;
  readonly isCurrent: boolean;
  readonly isHost: boolean;
};

export function PlayerItem({ player, isCurrent, isHost }: PlayerItemProps) {
  return (
    <li
      className="player-card"
      data-current={isCurrent}
      data-online={player.isConnected}
      data-eliminated={player.isEliminated}
    >
      <Avatar size="md" value={player.avatar} />

      <div className="player-content">
        <div className="player-header">
          <span className="player-name" title={player.name}>
            {player.name}
          </span>

          <div className="player-badges">
            {isCurrent && <span className="badge">you</span>}
            {isHost && <span className="badge">host</span>}
            {player.isEliminated && <span className="badge is-danger">out</span>}
            <span className={`badge ${player.isReady ? 'is-success' : ''}`}>
              {player.isReady ? 'ready' : 'not ready'}
            </span>
          </div>

          <span
            className="status-dot"
            data-state={player.isConnected ? 'connected' : 'disconnected'}
            aria-label={player.isConnected ? 'online' : 'offline'}
            title={player.isConnected ? 'online' : 'offline'}
          />
        </div>

        <div className="player-values">
          <span>Bal {player.balance}</span>
          <span>Bet {player.currentBet}</span>
          <span>Win {player.lastWin}</span>
        </div>
      </div>
    </li>
  );
}
