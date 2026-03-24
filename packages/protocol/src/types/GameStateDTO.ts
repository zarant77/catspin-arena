import type { PlayerDTO } from "./PlayerDTO";

export type GameStatusDTO = "lobby" | "running" | "finished";
export type RoundStatusDTO = "idle" | "betting" | "spinning" | "resolved";
export type SymbolIdDTO = "L1" | "L2" | "L3" | "L4" | "M1" | "M2" | "H1" | "H2";

export type WinningLineDTO = {
  readonly lineIndex: number;
  readonly symbol: SymbolIdDTO;
  readonly count: number;
  readonly multiplier: number;
};

export type SpinResultDTO = {
  readonly grid: SymbolIdDTO[][];
  readonly totalMultiplier: number;
  readonly winningLines: WinningLineDTO[];
};

export type RoundDTO = {
  readonly index: number;
  readonly status: RoundStatusDTO;
  readonly startedAt: number | null;
  readonly bettingClosesAt: number | null;
  readonly spinAt: number | null;
  readonly result: SpinResultDTO | null;
};

export type GameStateDTO = {
  readonly id: string;
  readonly status: GameStatusDTO;
  readonly hostPlayerId: string | null;
  readonly winnerPlayerId: string | null;
  readonly players: PlayerDTO[];
  readonly round: RoundDTO;
  readonly bettingDurationMs: number;
  readonly serverNow: number;
};
