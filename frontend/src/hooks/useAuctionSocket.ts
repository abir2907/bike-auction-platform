import { useCallback, useEffect, useRef, useState } from 'react';
import { connectSocket, getSocket } from '@/lib/socket';
import { useAuthStore } from '@/store/auth';

export interface BidEvent {
  auctionId: string;
  bid: { id: string; amount: number; bidderId: string; bidderName: string; createdAt: string };
  currentPrice: number;
  totalBids: number;
  endTime: string;
  extended: boolean;
}

export interface StatusEvent {
  auctionId: string;
  status: string;
  winnerId?: string | null;
  finalPrice?: number | null;
  reserveMet?: boolean;
}

interface Options {
  onBid?: (e: BidEvent) => void;
  onStatus?: (e: StatusEvent) => void;
}

/**
 * Subscribes to a single auction's real-time channel. Joins the room on mount,
 * relays `bid:new` / `auction:status` events, and exposes a promise-based
 * `placeBid` that uses the socket ack to report success/failure.
 */
export function useAuctionSocket(auctionId: string | undefined, opts: Options) {
  const { user } = useAuthStore();
  const [connected, setConnected] = useState(false);
  const cb = useRef(opts);
  cb.current = opts;

  useEffect(() => {
    if (!auctionId) return;
    const socket = connectSocket();

    const onConnect = () => {
      setConnected(true);
      socket.emit('auction:join', auctionId);
    };
    const onDisconnect = () => setConnected(false);
    const onBid = (e: BidEvent) => e.auctionId === auctionId && cb.current.onBid?.(e);
    const onStatus = (e: StatusEvent) => e.auctionId === auctionId && cb.current.onStatus?.(e);

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('bid:new', onBid);
    socket.on('auction:status', onStatus);

    if (socket.connected) onConnect();

    return () => {
      socket.emit('auction:leave', auctionId);
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('bid:new', onBid);
      socket.off('auction:status', onStatus);
    };
    // Reconnect/rejoin if the logged-in user changes (new token).
  }, [auctionId, user?.id]);

  const placeBid = useCallback(
    (amount: number): Promise<{ ok: boolean; error?: string; currentPrice?: number }> =>
      new Promise((resolve) => {
        const socket = getSocket();
        if (!socket.connected) socket.connect();
        socket
          .timeout(8000)
          .emit('bid:place', { auctionId, amount }, (err: unknown, res: { ok: boolean; error?: string; currentPrice?: number }) => {
            if (err) return resolve({ ok: false, error: 'Connection timed out. Try again.' });
            resolve(res);
          });
      }),
    [auctionId],
  );

  return { connected, placeBid };
}
