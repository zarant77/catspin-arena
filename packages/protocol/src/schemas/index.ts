import { z } from "zod";

export const roomIdSchema = z.string().min(1);

export const symbolIdSchema = z.enum([
  "L1",
  "L2",
  "L3",
  "L4",
  "M1",
  "M2",
  "H1",
  "H2",
]);

export const playerSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  balance: z.number().finite(),
  currentBet: z.number().finite(),
  isReady: z.boolean(),
  isConnected: z.boolean(),
  isEliminated: z.boolean(),
  lastWin: z.number().finite(),
});

export const winningLineSchema = z.object({
  lineIndex: z.number().int().nonnegative(),
  symbol: symbolIdSchema,
  count: z.number().int().min(1),
  multiplier: z.number().finite(),
});

export const spinResultSchema = z.object({
  grid: z.array(z.array(symbolIdSchema)),
  totalMultiplier: z.number().finite(),
  winningLines: z.array(winningLineSchema),
});

export const roundStatusSchema = z.enum([
  "idle",
  "betting",
  "spinning",
  "resolved",
]);

export const gameStatusSchema = z.enum(["lobby", "running", "finished"]);

export const roundSchema = z.object({
  index: z.number().int().nonnegative(),
  status: roundStatusSchema,
  startedAt: z.number().int().nullable(),
  bettingClosesAt: z.number().int().nullable(),
  spinAt: z.number().int().nullable(),
  result: spinResultSchema.nullable(),
});

export const gameStateSchema = z.object({
  id: z.string().min(1),
  status: gameStatusSchema,
  hostPlayerId: z.string().nullable(),
  winnerPlayerId: z.string().nullable(),
  players: z.array(playerSchema),
  round: roundSchema,
  bettingDurationMs: z.number().int().nonnegative(),
  serverNow: z.number().int(),
});

export const roomSchema = z.object({
  id: roomIdSchema,
  game: gameStateSchema,
});

export type SymbolIdSchema = z.infer<typeof symbolIdSchema>;
export type PlayerSchema = z.infer<typeof playerSchema>;
export type WinningLineSchema = z.infer<typeof winningLineSchema>;
export type SpinResultSchema = z.infer<typeof spinResultSchema>;
export type RoundSchema = z.infer<typeof roundSchema>;
export type GameStateSchema = z.infer<typeof gameStateSchema>;
export type RoomSchema = z.infer<typeof roomSchema>;
