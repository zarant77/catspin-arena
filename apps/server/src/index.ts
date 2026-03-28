import Fastify from 'fastify';
import cors from '@fastify/cors';

import { GameLoop } from './game/GameLoop';
import { RoomManager } from './rooms/RoomManager';
import { attachWebSocketServer } from './ws/server';
import { registerCreateRoomRoute } from './http/createRoom';

async function bootstrap(): Promise<void> {
  const app = Fastify({
    logger: true,
  });

  await app.register(cors, {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type'],
  });

  const roomManager = new RoomManager();

  const gameLoop = new GameLoop({
    roomManager,
    intervalMs: 100,
  });

  registerCreateRoomRoute(app, roomManager);
  attachWebSocketServer(app, roomManager);

  gameLoop.start();

  let isShuttingDown = false;

  const shutdown = async (signal: 'SIGINT' | 'SIGTERM'): Promise<void> => {
    if (isShuttingDown === true) {
      return;
    }

    isShuttingDown = true;
    app.log.info({ signal }, 'Shutting down server');

    try {
      gameLoop.stop();
      await app.close();
      process.exit(0);
    } catch (error) {
      app.log.error({ error }, 'Failed to shut down cleanly');
      process.exit(1);
    }
  };

  process.once('SIGINT', () => {
    void shutdown('SIGINT');
  });

  process.once('SIGTERM', () => {
    void shutdown('SIGTERM');
  });

  await app.listen({
    port: 3000,
    host: '0.0.0.0',
  });

  app.log.info('HTTP server started on http://localhost:3000');
  app.log.info('WebSocket server attached on ws://localhost:3000/ws');
  app.log.info('Game loop started');
}

void bootstrap();
