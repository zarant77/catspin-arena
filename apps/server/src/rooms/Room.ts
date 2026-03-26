import {
  applyCommand,
  createGame,
  getPublicState,
  tickGame,
  type GameCommand,
  type GameState,
  type PublicGameState,
} from '@catspin/core';

import { PlayerSession, type PlayerSessionSnapshot } from './PlayerSession';

export type RoomSnapshot = {
  readonly id: string;
  readonly game: PublicGameState;
  readonly sessions: readonly PlayerSessionSnapshot[];
};

export type RoomSubscriber = (snapshot: RoomSnapshot) => void;

export class Room {
  public readonly id: string;

  private state: GameState;
  private readonly sessionsByPlayerId: Map<string, PlayerSession>;
  private readonly subscribers: Set<RoomSubscriber>;

  public constructor(args: { id: string; seed: number }) {
    this.id = args.id;
    this.state = createGame({
      id: args.id,
      seed: args.seed,
    });
    this.sessionsByPlayerId = new Map<string, PlayerSession>();
    this.subscribers = new Set<RoomSubscriber>();
  }

  public subscribe(subscriber: RoomSubscriber): () => void {
    this.subscribers.add(subscriber);
    subscriber(this.getSnapshot());

    return () => {
      this.subscribers.delete(subscriber);
    };
  }

  public getState(): GameState {
    return this.state;
  }

  public getPublicState(): PublicGameState {
    const publicState = getPublicState(this.state);

    return {
      ...publicState,
      players: publicState.players.map((player) => {
        const session = this.sessionsByPlayerId.get(player.id);

        return {
          ...player,
          isConnected: session?.getSnapshot().connected ?? false,
        };
      }),
    };
  }

  public getSnapshot(): RoomSnapshot {
    return {
      id: this.id,
      game: this.getPublicState(),
      sessions: Array.from(this.sessionsByPlayerId.values()).map((session) => session.getSnapshot()),
    };
  }

  public getPlayerSession(playerId: string): PlayerSession | null {
    return this.sessionsByPlayerId.get(playerId) ?? null;
  }

  public hasPlayer(playerId: string): boolean {
    return this.state.players.some((player) => player.id === playerId);
  }

  public joinPlayer(args: { sessionId: string; playerId: string; name: string }): RoomSnapshot {
    const existingSession = this.sessionsByPlayerId.get(args.playerId);

    if (existingSession !== undefined) {
      existingSession.markConnected();
      this.broadcast();
      return this.getSnapshot();
    }

    const session = new PlayerSession({
      sessionId: args.sessionId,
      playerId: args.playerId,
      roomId: this.id,
      name: args.name,
    });

    this.sessionsByPlayerId.set(args.playerId, session);

    this.dispatch({
      type: 'add_player',
      playerId: args.playerId,
      name: args.name,
    });

    return this.getSnapshot();
  }

  public removePlayer(playerId: string): RoomSnapshot {
    if (this.sessionsByPlayerId.has(playerId) === false) {
      return this.getSnapshot();
    }

    this.sessionsByPlayerId.delete(playerId);

    this.dispatch({
      type: 'remove_player',
      playerId,
    });

    return this.getSnapshot();
  }

  public disconnectPlayer(playerId: string): RoomSnapshot {
    const session = this.sessionsByPlayerId.get(playerId);

    if (session === undefined) {
      return this.getSnapshot();
    }

    session.markDisconnected();
    this.broadcast();

    return this.getSnapshot();
  }

  public setReady(playerId: string, value: boolean): RoomSnapshot {
    this.dispatch({
      type: 'set_ready',
      playerId,
      value,
    });

    return this.getSnapshot();
  }

  public setBet(playerId: string, amount: number): RoomSnapshot {
    this.dispatch({
      type: 'set_bet',
      playerId,
      amount,
    });

    return this.getSnapshot();
  }

  public confirmBet(playerId: string): RoomSnapshot {
    this.dispatch({
      type: 'confirm_bet',
      playerId,
    });

    return this.getSnapshot();
  }

  public startGame(playerId: string, now: number): RoomSnapshot {
    this.dispatch({
      type: 'start_game',
      playerId,
      now,
    });

    return this.getSnapshot();
  }

  public dispatch(command: GameCommand): boolean {
    const prevState = this.state;
    const nextState = applyCommand(prevState, command);

    if (nextState === prevState) {
      return false;
    }

    this.state = nextState;
    this.broadcast();

    return true;
  }

  public tick(now: number): boolean {
    const prevState = this.state;
    const nextState = tickGame(prevState, now);

    if (nextState === prevState) {
      return false;
    }

    this.state = nextState;
    this.broadcast();

    return true;
  }

  public isEmpty(): boolean {
    return this.sessionsByPlayerId.size === 0;
  }

  private broadcast(): void {
    const snapshot = this.getSnapshot();

    for (const subscriber of this.subscribers) {
      subscriber(snapshot);
    }
  }
}
