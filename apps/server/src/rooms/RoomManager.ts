import type { MathProfileId } from '@catspin/core';
import { randomId } from '@catspin/shared';

import { Room } from './Room';

type CreateRoomOptions = {
  readonly mathProfileId?: MathProfileId;
};

export class RoomManager {
  private readonly roomsById: Map<string, Room>;

  public constructor() {
    this.roomsById = new Map<string, Room>();
  }

  public createRoom(roomId?: string, options?: CreateRoomOptions): Room {
    const id = roomId ?? this.generateUniqueRoomId();
    const existingRoom = this.roomsById.get(id);

    if (existingRoom !== undefined) {
      return existingRoom;
    }

    const seed = Date.now() ^ Math.floor(Math.random() * 0xffffffff);

    const room = new Room({
      id,
      seed,
      mathProfileId: options?.mathProfileId,
    });

    this.roomsById.set(id, room);

    return room;
  }

  public getRoom(roomId: string): Room | null {
    return this.roomsById.get(roomId) ?? null;
  }

  public getOrCreateRoom(roomId: string): Room {
    return this.getRoom(roomId) ?? this.createRoom(roomId);
  }

  public removeRoom(roomId: string): boolean {
    return this.roomsById.delete(roomId);
  }

  public removeEmptyRooms(): number {
    let removedCount = 0;

    for (const [roomId, room] of this.roomsById.entries()) {
      if (room.isEmpty() === false) {
        continue;
      }

      this.roomsById.delete(roomId);
      removedCount += 1;
    }

    return removedCount;
  }

  public getRooms(): readonly Room[] {
    return Array.from(this.roomsById.values());
  }

  public tickAll(now: number): number {
    let updatedCount = 0;

    for (const room of this.roomsById.values()) {
      if (room.tick(now) === true) {
        updatedCount += 1;
      }
    }

    return updatedCount;
  }

  private generateUniqueRoomId(): string {
    let id = randomId();

    while (this.roomsById.has(id)) {
      id = randomId();
    }

    return id;
  }
}
