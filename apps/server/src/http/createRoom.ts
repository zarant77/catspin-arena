import crypto from 'node:crypto';
import type { FastifyInstance } from 'fastify';
import { getMathProfileOptions, type MathProfileId } from '@catspin/core';

import type { RoomManager } from '../rooms/RoomManager';

function createRoomId(): string {
  return crypto.randomBytes(6).toString('hex');
}

type CreateRoomBody = {
  readonly mathProfileId?: MathProfileId;
};

export function registerCreateRoomRoute(app: FastifyInstance, roomManager: RoomManager): void {
  app.get('/math-profiles', async () => {
    return {
      profiles: getMathProfileOptions(),
    };
  });

  app.post('/rooms', async (request) => {
    const body = (request.body ?? {}) as CreateRoomBody;
    const roomId = createRoomId();

    const room = roomManager.createRoom(roomId, {
      mathProfileId: body.mathProfileId,
    });

    return {
      roomId: room.id,
    };
  });
}
