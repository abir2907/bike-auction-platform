import { io, Socket } from 'socket.io-client';
import { getAccessToken } from './api';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || undefined; // undefined = same origin

let socket: Socket | null = null;

/**
 * Lazily creates (and reuses) the authenticated Socket.IO connection. The JWT
 * is supplied at handshake time and refreshed on every (re)connect attempt so
 * a rotated token is always used.
 */
export function getSocket(): Socket {
  if (socket) return socket;
  socket = io(SOCKET_URL ?? '/', {
    autoConnect: false,
    transports: ['websocket'],
    auth: (cb) => cb({ token: getAccessToken() ?? '' }),
  });
  return socket;
}

export function connectSocket(): Socket {
  const s = getSocket();
  if (!s.connected) s.connect();
  return s;
}

export function disconnectSocket(): void {
  socket?.disconnect();
}
