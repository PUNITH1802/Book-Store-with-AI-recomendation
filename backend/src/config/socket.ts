import { Server as HttpServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import { env } from './env';
import { logger } from '../utils/logger';

let io: SocketServer;

export function getIO(): SocketServer {
  if (!io) throw new Error('Socket.IO not initialized');
  return io;
}

export function initSocketServer(httpServer: HttpServer): void {
  io = new SocketServer(httpServer, {
    cors: { origin: env.CORS_ORIGIN, credentials: true },
    transports: ['websocket', 'polling'],
  });

  io.on('connection', (socket) => {
    const userId = socket.handshake.query.userId as string;
    if (userId) {
      socket.join(`user:${userId}`);
      logger.debug('Socket connected', { socketId: socket.id, userId });
    }

    socket.on('disconnect', () => {
      logger.debug('Socket disconnected', { socketId: socket.id });
    });
  });

  logger.info('Socket.IO initialized');
}

export function emitToUser(userId: string, event: string, data: unknown): void {
  getIO().to(`user:${userId}`).emit(event, data);
}
