import { useEffect, useMemo, useState } from 'react';
import type { RoomDTO } from '@catspin/protocol';
import type { PlayerView } from '../../types/playerView';
import { Avatar } from '../common/Avatar';

type WinScreenProps = {
  readonly room: RoomDTO | null;
  readonly playerId: string | null;
  readonly onLeaveRoom: () => void;
};

function getWinner(room: RoomDTO): PlayerView | null {
  const alive = room.game.players.filter((player) => player.isEliminated === false);

  if (alive.length === 1) {
    return alive[0] ?? null;
  }

  const sorted = [...room.game.players].sort((a, b) => b.balance - a.balance);

  return sorted[0] ?? null;
}

export function WinScreen(props: WinScreenProps) {
  const { room, playerId, onLeaveRoom } = props;

  const [visible, setVisible] = useState(false);

  const isFinished = room?.game.status === 'finished';

  const winner = useMemo(() => {
    if (!room || !isFinished) return null;
    return getWinner(room);
  }, [room, isFinished]);

  useEffect(() => {
    if (!isFinished) {
      setVisible(false);
      return;
    }

    const t = setTimeout(() => setVisible(true), 1500);
    return () => clearTimeout(t);
  }, [isFinished, room?.game.round.index]);

  if (!room || !isFinished || !visible || !winner) {
    return null;
  }

  return (
    <div className="win-overlay">
      <div className="win-card">
        <div className="label">Game finished</div>

        <h2 className="title">🏆 Winner</h2>

        <div className="player">
          <Avatar value={winner.avatar} size="lg" mood="win" />
          <div className="name">{winner.id === playerId ? 'You' : winner.name}</div>
          <div className="balance">{winner.balance}</div>
        </div>

        <button onClick={onLeaveRoom}>Leave</button>
      </div>
    </div>
  );
}
