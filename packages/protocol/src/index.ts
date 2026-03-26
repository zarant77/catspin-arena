export type {
  ClientEvent,
  JoinRoomEvent,
  LeaveRoomEvent,
  SetBetEvent,
  SetReadyEvent,
  StartGameEvent,
} from './events/client';

export type { ErrorEvent, JoinedRoomEvent, LeftRoomEvent, RoomStateEvent, ServerEvent } from './events/server';

export type {
  GameConfigDTO,
  GameStateDTO,
  GameStatusDTO,
  PaylineDTO,
  PaylinePresentationConfigDTO,
  RoundDTO,
  RoundStatusDTO,
  SpinResultDTO,
  SymbolIdDTO,
  WinningLineDTO,
} from './types/GameStateDTO';

export type { PlayerDTO } from './types/PlayerDTO';
export type { RoomDTO } from './types/RoomDTO';
