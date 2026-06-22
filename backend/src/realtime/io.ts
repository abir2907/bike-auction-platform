import { Server } from 'socket.io';

/**
 * Holds the Socket.IO server instance so non-socket code (REST controllers,
 * the auction scheduler) can broadcast real-time events without a circular
 * import on the socket-setup module.
 */
let io: Server | null = null;

export function setIo(instance: Server): void {
  io = instance;
}

export function getIo(): Server {
  if (!io) throw new Error('Socket.IO server has not been initialised');
  return io;
}

export const auctionRoom = (auctionId: string) => `auction:${auctionId}`;

/** Broadcast an auction-scoped event to everyone watching that auction. */
export function emitToAuction(auctionId: string, event: string, payload: unknown): void {
  io?.to(auctionRoom(auctionId)).emit(event, payload);
}
