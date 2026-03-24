import { useEffect, useState } from "react";
import type { RoomDTO } from "@catspin/protocol";

type Props = {
  readonly room: RoomDTO;
  readonly serverTimeOffsetMs: number;
};

export function RoundTimer({ room, serverTimeOffsetMs }: Props) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => {
      setNow(Date.now());
    }, 250);

    return () => window.clearInterval(id);
  }, []);

  const round = room.game.round;

  if (round.status !== "betting" || round.bettingClosesAt === null) {
    return null;
  }

  const serverNow = now + serverTimeOffsetMs;
  const remainingMs = Math.max(0, round.bettingClosesAt - serverNow);
  const seconds = Math.round(remainingMs / 1000);
  const isUrgent = seconds <= 3;

  if (seconds <= 0) {
    return null;
  }

  return (
    <span
      className={`round-timer ${isUrgent ? "is-urgent" : ""}`}
      aria-label={`Time left: ${seconds} seconds`}
      title={`Time left: ${seconds} seconds`}
    >
      {seconds}
    </span>
  );
}
