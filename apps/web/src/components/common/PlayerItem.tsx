import type { PlayerView } from "../../types/playerView";

type PlayerItemProps = {
  readonly player: PlayerView;
  readonly isCurrent: boolean;
  readonly isHost: boolean;
  readonly variant: "lobby" | "game";
};

export function PlayerItem(props: PlayerItemProps) {
  const { player, isCurrent, isHost, variant } = props;

  return (
    <li className={`player-item ${player.isConnected ? "online" : "offline"}`}>
      <div className="main">
        <div className="name">
          <strong>{player.name}</strong>
          {isCurrent ? <span className="tag">you</span> : null}
          {isHost ? <span className="crown">👑</span> : null}
        </div>

        <div
          className={`connection ${player.isConnected ? "online" : "offline"}`}
        >
          <span className="dot" />
          <span>{player.isConnected ? "online" : "offline"}</span>
        </div>
      </div>

      {variant === "lobby" ? (
        <div className="meta">
          <span className={`badge ${player.isReady ? "ready" : "waiting"}`}>
            {player.isReady ? "ready" : "not ready"}
          </span>
        </div>
      ) : (
        <div className="meta">
          <span>Balance: {player.balance}</span>
          <span>Bet: {player.currentBet}</span>
          <span>Last win: {player.lastWin}</span>
          {player.isEliminated ? (
            <span className="danger">Eliminated</span>
          ) : null}
        </div>
      )}
    </li>
  );
}
