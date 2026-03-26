import { z } from 'zod';

export const roomIdSchema = z.string().min(1);

export const symbolIdSchema = z.enum(['L1', 'L2', 'L3', 'L4', 'M1', 'M2', 'H1', 'H2']);

export const playerSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  balance: z.number().int().nonnegative(),
  currentBet: z.number().int().nonnegative(),
  lastBet: z.number().int().nonnegative().nullable(),
  isReady: z.boolean(),
  isConnected: z.boolean(),
  isEliminated: z.boolean(),
  lastWin: z.number().int().nonnegative(),
});

export const winningLineSchema = z.object({
  lineIndex: z.number().int().nonnegative(),
  symbol: symbolIdSchema,
  count: z.number().int().min(1),
  multiplier: z.number().int().nonnegative(),
});

export const spinResultSchema = z.object({
  grid: z.array(z.array(symbolIdSchema)),
  totalMultiplier: z.number().int().nonnegative(),
  winningLines: z.array(winningLineSchema),
});

export const roundStatusSchema = z.enum(['idle', 'betting', 'spinning', 'resolved']);

export const gameStatusSchema = z.enum(['lobby', 'running', 'finished']);

export const roundSchema = z.object({
  index: z.number().int().nonnegative(),
  status: roundStatusSchema,
  startedAt: z.number().int().nullable(),
  bettingClosesAt: z.number().int().nullable(),
  spinAt: z.number().int().nullable(),
  result: spinResultSchema.nullable(),
  winnerPlayerIds: z.array(z.string().min(1)),
  payoutAmount: z.number().int().nonnegative(),
});

export const paylineSchema = z.array(z.number().int().min(0).max(2)).length(5);

export const gameConfigSchema = z.object({
  minBet: z.number().int().positive(),
  maxBet: z.number().int().positive(),
  bettingDurationMs: z.number().int().nonnegative(),
  spinDurationMs: z.number().int().nonnegative(),
  paylines: z.array(paylineSchema),
});

export const gameStateSchema = z.object({
  id: z.string().min(1),
  status: gameStatusSchema,
  hostPlayerId: z.string().nullable(),
  winnerPlayerId: z.string().nullable(),
  players: z.array(playerSchema),
  round: roundSchema,
  config: gameConfigSchema,
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
export type GameConfigSchema = z.infer<typeof gameConfigSchema>;
export type GameStateSchema = z.infer<typeof gameStateSchema>;
export type RoomSchema = z.infer<typeof roomSchema>;
