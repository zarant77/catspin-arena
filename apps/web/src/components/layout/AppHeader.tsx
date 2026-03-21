import { SocketStatus } from "../../network/socket";

type AppHeaderProps = {
  readonly connectionStatus: SocketStatus;
  readonly playerName: string;
  readonly onChangeName: () => void;
};

export function AppHeader({
  connectionStatus,
  playerName,
  onChangeName,
}: AppHeaderProps) {
  const hasPlayerName = playerName.trim().length > 0;

  return (
    <header className="header">
      <div className="title">
        <div className="main">CatSpin Arena</div>
        <div className="sub">Neon Arcade Casino</div>
      </div>

      <div className="right">
        <div className="player" onClick={onChangeName}>
          {hasPlayerName ? `😼 ${playerName}` : "Guest"}
        </div>

        <div
          className={`status ${connectionStatus}`}
          aria-label={connectionStatus}
          title={connectionStatus}
        >
          <span className="dot" />
        </div>
      </div>
    </header>
  );
}
