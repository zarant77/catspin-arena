export type JoinRoomEvent = {
  type: 'join_room';
  roomId: string;
  sessionId: string;
  playerId: string;
  name: string;
};

export type LeaveRoomEvent = {
  type: 'leave_room';
};

export type SetReadyEvent = {
  type: 'set_ready';
  playerId: string;
  value: boolean;
};

export type SetBetEvent = {
  type: 'set_bet';
  playerId: string;
  amount: number;
};

export type ConfirmBetEvent = {
  type: 'confirm_bet';
  playerId: string;
};

export type StartGameEvent = {
  type: 'start_game';
  playerId: string;
};

export type ClientEvent =
  | JoinRoomEvent
  | LeaveRoomEvent
  | SetReadyEvent
  | SetBetEvent
  | ConfirmBetEvent
  | StartGameEvent;
