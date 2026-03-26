export type PlayerId = string;

export type PlayerState = {
  readonly id: PlayerId;
  readonly name: string;
  readonly balance: number;
  readonly currentBet: number;
  readonly lastBet: number | null;
  readonly isReady: boolean;
  readonly isConnected: boolean;
  readonly isEliminated: boolean;
  readonly lastWin: number;
  readonly hasConfirmedBet: boolean;
};

export function createPlayer(args: { id: PlayerId; name: string; startBalance: number }): PlayerState {
  return {
    id: args.id,
    name: args.name,
    balance: args.startBalance,
    currentBet: 0,
    lastBet: null,
    isReady: false,
    isConnected: true,
    isEliminated: false,
    lastWin: 0,
    hasConfirmedBet: false,
  };
}
