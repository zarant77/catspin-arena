import type { RoomDTO } from "@catspin/protocol";
import { Section } from "../../layout/Section";
import type { PlayerView } from "../../../types/playerView";
import { SlotMachine } from "./SlotMachine";
import { PlayerItem } from "./PlayerItem";
import { BetControls } from "./BetControls";
import { GameStatus } from "./GameStatus";
import { RoundTimer } from "./RoundTimer";

type GameScreenProps = {
  readonly room: RoomDTO;
  readonly playerId: string | null;
  readonly currentPlayer: PlayerView | null;
  readonly betInput: number;
  readonly serverTimeOffsetMs: number;
  readonly onBetInputChange: (value: number) => void;
  readonly onSetBet: () => void;
  readonly onLeaveRoom: () => void;
};

function getPlayersWaitingForBet(room: RoomDTO): readonly PlayerView[] {
  return room.game.players.filter((player) => {
    if (player.isEliminated) {
      return false;
    }

    if (!player.isConnected) {
      return false;
    }

    return player.currentBet <= 0;
  });
}

export function GameScreen(props: GameScreenProps) {
  const {
    room,
    playerId,
    currentPlayer,
    betInput,
    onBetInputChange,
    onSetBet,
    onLeaveRoom,
  } = props;

  const round = room.game.round;
  const result = round.result;

  const isBetting = round.status === "betting";
  const isSpinning = round.status === "spinning";

  const waitingPlayers = getPlayersWaitingForBet(room);

  const displayGrid = result?.grid ?? [];
  const winningLines = result?.winningLines ?? [];

  const minBet =
    currentPlayer && currentPlayer.balance < 10 ? currentPlayer.balance : 10;
  const maxBet =
    currentPlayer && currentPlayer.balance < 100 ? currentPlayer.balance : 100;

  return (
    <Section
      title={`Round #${round.index}`}
      className="game-screen"
      actions={
        <>
          <RoundTimer
            room={room}
            serverTimeOffsetMs={props.serverTimeOffsetMs}
          />
          <button type="button" onClick={onLeaveRoom}>
            Leave room
          </button>
        </>
      }
    >
      <div className="game-layout">
        <div className="game-board">
          <SlotMachine
            grid={displayGrid}
            isSpinning={isSpinning}
            winningLines={winningLines}
          />

          <BetControls
            value={betInput}
            disabled={!isBetting}
            onChange={onBetInputChange}
            onSubmit={onSetBet}
            min={minBet}
            max={maxBet}
            step={minBet}
          />
        </div>

        <div className="game-players-scroll">
          <div className="game-players">
            {room.game.players.map((player) => (
              <PlayerItem
                key={player.id}
                player={player}
                isCurrent={player.id === playerId}
                isHost={room.game.hostPlayerId === player.id}
              />
            ))}
          </div>
        </div>
      </div>

      <GameStatus
        isBetting={isBetting}
        isSpinning={isSpinning}
        waitingPlayers={waitingPlayers}
        roundIndex={round.index}
      />
    </Section>
  );
}
