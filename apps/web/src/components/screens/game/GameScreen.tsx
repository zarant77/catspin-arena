import type { RoomDTO } from '@catspin/protocol';
import { useClientStoreState } from '../../../state/storeContext';
import type { PlayerView } from '../../../types/playerView';
import { Section } from '../../layout/Section';
import { SlotMachine } from './SlotMachine';
import { PlayerItem } from './PlayerItem';
import { BetControls } from './BetControls';
import { GameStatus } from './GameStatus';
import { RoundTimer } from './RoundTimer';

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
  const minBet = room.game.config.minBet;

  return room.game.players.filter((player) => {
    if (player.isEliminated) {
      return false;
    }

    if (!player.isConnected) {
      return false;
    }

    return player.currentBet < minBet;
  });
}

export function GameScreen(props: GameScreenProps) {
  const { room, playerId, currentPlayer, betInput, onBetInputChange, onSetBet, onLeaveRoom, serverTimeOffsetMs } =
    props;

  const state = useClientStoreState();

  const round = room.game.round;
  const result = round.result;

  const isBetting = round.status === 'betting';
  const isSpinning = round.status === 'spinning';

  const waitingPlayers = getPlayersWaitingForBet(room);

  const displayGrid = result?.grid ?? [];
  const winningLines = result?.winningLines ?? [];

  const roomMinBet = room.game.config.minBet;
  const roomMaxBet = room.game.config.maxBet;
  const balance = currentPlayer?.balance ?? 0;

  const effectiveMaxBet = Math.min(roomMaxBet, balance);
  const canPlaceBet =
    currentPlayer !== null &&
    currentPlayer.isEliminated === false &&
    currentPlayer.isConnected === true &&
    isBetting &&
    effectiveMaxBet >= roomMinBet;

  return (
    <Section
      title={`Round #${round.index}`}
      className="game-screen"
      actions={
        <>
          <RoundTimer room={room} serverTimeOffsetMs={serverTimeOffsetMs} />
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
            paylines={state.room?.game.config.paylines ?? []}
            roundStatus={round.status}
            roundIndex={round.index}
            paylinePresentation={room.game.config.paylinePresentation}
            winningLines={winningLines}
          />

          <BetControls
            value={betInput || roomMinBet}
            disabled={!canPlaceBet}
            onChange={onBetInputChange}
            onSubmit={onSetBet}
            min={roomMinBet}
            max={effectiveMaxBet}
            step={roomMinBet}
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
