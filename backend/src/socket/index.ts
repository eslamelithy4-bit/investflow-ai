import { Server as IOServer } from 'socket.io';
import type { Server as HttpServer } from 'node:http';
import { verifyAccess } from '../lib/jwt.js';
import { logger } from '../lib/logger.js';

let io: IOServer | null = null;

export function initSocket(httpServer: HttpServer) {
  io = new IOServer(httpServer, {
    cors: { origin: process.env.FRONTEND_URL || '*', credentials: true },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token as string | undefined;
    if (!token) {
      socket.join('prices');
      return next();
    }
    try {
      const payload = verifyAccess(token);
      (socket as any).user = payload;
      socket.join(`user:${payload.sub}`);
      socket.join('prices');
      if (payload.isAdmin) socket.join('admin');
      next();
    } catch {
      next();
    }
  });

  io.on('connection', (socket) => {
    logger.debug({ id: socket.id }, 'socket connected');
  });

  return io;
}

export function getIO(): IOServer {
  if (!io) throw new Error('Socket.IO not initialized');
  return io;
}

export function emitToUser(userId: string, event: string, payload: any) {
  io?.to(`user:${userId}`).emit(event, payload);
}
export function emitToAdmins(event: string, payload: any) {
  io?.to('admin').emit(event, payload);
}
export function emitPrices(payload: any) {
  io?.to('prices').emit('price:update', payload);
}
