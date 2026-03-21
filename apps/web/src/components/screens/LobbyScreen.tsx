import type { RoomDTO } from "@catspin/protocol";
import type { PlayerView } from "../../types/playerView";
import { Section } from "../layout/Section";
import { PlayerItem } from "../common/PlayerItem";

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
  const {
    room,
    playerId,
    currentPlayer,
    players,
    isHost,
    onToggleReady,
    onStartGame,
    onLeaveRoom,
  } = props;

  return (
    <>
      <Section title="Lobby">
        <div className="lobby-screen">
          <div className="room-code">Room code: {room.id}</div>

          <div className="actions">
            <button
              type="button"
              onClick={onToggleReady}
              disabled={currentPlayer === null}
            >
              {currentPlayer?.isReady ? "Unready" : "Ready"}
            </button>

            {isHost && (
              <button type="button" onClick={onStartGame}>
                Start game
              </button>
            )}

            <button type="button" onClick={onLeaveRoom}>
              Leave room
            </button>
          </div>
        </div>
      </Section>

      <Section title="Players">
        <div className="players-list">
          <ul>
            {players.map((player) => (
              <PlayerItem
                key={player.id}
                player={player}
                isCurrent={player.id === playerId}
                isHost={room.game.hostPlayerId === player.id}
                variant="lobby"
              />
            ))}
          </ul>
        </div>
      </Section>
    </>
  );
}
