import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { env } from '../config/env';
import { logger } from '../config/logger';
import { verifyAccessToken } from '../utils/jwt';
import { ApiError } from '../utils/ApiError';
import { audit } from '../utils/audit';
import { auctionRoom, setIo } from './io';
import { broadcastBid } from './auctionEvents';
import * as auctionService from '../modules/auctions/auctions.service';

interface SocketUser {
  id: string;
  role: string;
  email: string;
}

/**
 * Real-time layer. Clients connect, authenticate with their JWT access token,
 * join an auction "room", and place bids over the socket. The server is the
 * single source of truth — every bid is validated by the same service the REST
 * endpoint uses, then broadcast to the room.
 */
export function initSocket(httpServer: HttpServer): Server {
  const io = new Server(httpServer, {
    cors: { origin: env.CLIENT_URL, credentials: true },
    // Cap payload size to avoid abuse.
    maxHttpBufferSize: 1e5,
  });
  setIo(io);

  // Auth handshake: a valid access token is required to connect.
  io.use((socket, next) => {
    const token =
      (socket.handshake.auth?.token as string) ||
      (socket.handshake.headers.authorization?.replace('Bearer ', '') ?? '');
    if (!token) return next(new Error('UNAUTHORIZED'));
    try {
      const payload = verifyAccessToken(token);
      (socket.data as { user: SocketUser }).user = {
        id: payload.sub,
        role: payload.role,
        email: payload.email,
      };
      next();
    } catch {
      next(new Error('UNAUTHORIZED'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const user = (socket.data as { user: SocketUser }).user;
    logger.debug({ userId: user.id, socketId: socket.id }, 'Socket connected');

    socket.on('auction:join', (auctionId: string) => {
      if (typeof auctionId !== 'string') return;
      socket.join(auctionRoom(auctionId));
    });

    socket.on('auction:leave', (auctionId: string) => {
      if (typeof auctionId !== 'string') return;
      socket.leave(auctionRoom(auctionId));
    });

    socket.on(
      'bid:place',
      async (
        payload: { auctionId: string; amount: number },
        ack?: (res: { ok: boolean; error?: string; currentPrice?: number }) => void,
      ) => {
        try {
          if (!payload || typeof payload.amount !== 'number' || !payload.auctionId) {
            throw ApiError.badRequest('Invalid bid payload');
          }
          if (user.role === 'ADMIN') {
            throw ApiError.forbidden('Admins cannot place bids');
          }
          const result = await auctionService.placeBid(payload.auctionId, user.id, payload.amount);
          broadcastBid(result);
          audit({
            userId: user.id,
            action: 'BID_PLACE',
            entity: 'Auction',
            entityId: payload.auctionId,
            metadata: { amount: payload.amount, via: 'ws' },
          });
          ack?.({ ok: true, currentPrice: Number(result.auction.currentPrice) });
        } catch (err) {
          const message = err instanceof ApiError ? err.message : 'Could not place bid';
          ack?.({ ok: false, error: message });
          // Also push a private rejection event for clients not using acks.
          socket.emit('bid:rejected', { auctionId: payload?.auctionId, error: message });
        }
      },
    );

    socket.on('disconnect', () => {
      logger.debug({ socketId: socket.id }, 'Socket disconnected');
    });
  });

  logger.info('✅ Socket.IO initialised');
  return io;
}
