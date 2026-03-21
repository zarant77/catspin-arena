import { useEffect } from "react";
import type { RoomDTO } from "@catspin/protocol";
import { Section } from "../layout/Section";
import type { PlayerView } from "../../types/playerView";
import { SlotMachine } from "../slot/SlotMachine";
import { PlayerItem } from "../common/PlayerItem";
import { BetControls } from "../common/BetControls";
import { useClientStore } from "../../state/storeContext";

type GameScreenProps = {
  readonly room: RoomDTO;
  readonly playerId: string | null;
  readonly currentPlayer: PlayerView | null;
  readonly betInput: number;
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

  const store = useClientStore();

  const round = room.game.round;
  const result = round.result;

  const isBetting = round.status === "betting";
  const isSpinning = round.status === "spinning";
  const isResolved = round.status === "resolved";

  const waitingPlayers = getPlayersWaitingForBet(room);

  const displayGrid = result?.grid ?? [];
  const winningLines = result?.winningLines ?? [];
  const totalMultiplier = result?.totalMultiplier ?? 0;

  useEffect(() => {
    if (isBetting) {
      if (waitingPlayers.length > 0) {
        store.setFooter(
          `Waiting for bets from: ${waitingPlayers.map((player) => player.name).join(", ")}`,
        );
      } else {
        store.setFooter("All bets are placed. Waiting for spin...");
      }

      return () => {
        store.clearFooter();
      };
    }

    if (isSpinning) {
      store.setFooter("Spinning...", `Round #${round.index}`);

      return () => {
        store.clearFooter();
      };
    }

    if (isResolved) {
      store.setFooter(
        `Round resolved. Total multiplier: x${totalMultiplier}`,
        winningLines.length > 0
          ? winningLines
              .map(
                (line) =>
                  `line ${line.lineIndex}, ${line.symbol} x${line.count}, mult x${line.multiplier}`,
              )
              .join(" | ")
          : "Winning lines: none",
      );

      return () => {
        store.clearFooter();
      };
    }

    store.setFooter(`Round #${round.index} in progress`);

    return () => {
      store.clearFooter();
    };
  }, [
    store,
    isBetting,
    isSpinning,
    isResolved,
    waitingPlayers,
    round.index,
    totalMultiplier,
    winningLines,
  ]);

  return (
    <Section
      title={`Round #${round.index}`}
      actions={
        <button type="button" onClick={onLeaveRoom}>
          Leave room
        </button>
      }
    >
      <div className="game-screen">
        <div className="game-screen-center">
          <div className="game-machine-layout">
            <div className="game-machine-wrap">
              <SlotMachine
                grid={displayGrid}
                isSpinning={isSpinning}
                winningLines={winningLines}
              />
            </div>

            <BetControls
              value={betInput}
              disabled={!isBetting}
              currentPlayer={currentPlayer}
              onChange={onBetInputChange}
              onSubmit={onSetBet}
              orientation="horizontal"
            />
          </div>
        </div>

        <div className="players-section">
          {room.game.players.map((player) => (
            <PlayerItem
              key={player.id}
              player={player}
              isCurrent={player.id === playerId}
              isHost={room.game.hostPlayerId === player.id}
              variant="game"
            />
          ))}
        </div>
      </div>
    </Section>
  );
}
