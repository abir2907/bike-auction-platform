import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Gavel } from 'lucide-react';
import { auctionsService } from '@/services/auctions.service';
import { getApiErrorMessage } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';

interface VehicleLite {
  id: string;
  title: string;
  price?: string | number;
}

interface Props {
  /** When set, the modal is open and creates an auction for this vehicle. */
  vehicle: VehicleLite | null;
  onClose: () => void;
  onCreated?: () => void;
}

interface FormValues {
  startingPrice: string;
  reservePrice: string;
  buyNowPrice: string;
  bidIncrement: string;
  startTime: string;
  endTime: string;
  antiSnipeSeconds: string;
}

function toLocalInput(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/**
 * Schedule an auction for a vehicle. Available to the vehicle's owner (seller)
 * or an admin. The "Direct buy price" is optional — when set, buyers can
 * purchase the vehicle instantly at that price instead of bidding.
 */
export function CreateAuctionModal({ vehicle, onClose, onCreated }: Props) {
  const toast = useToast();
  const qc = useQueryClient();

  const now = new Date();
  const inOneDay = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    defaultValues: {
      startingPrice: vehicle?.price ? String(Number(vehicle.price)) : '',
      reservePrice: '',
      buyNowPrice: '',
      bidIncrement: '500',
      startTime: toLocalInput(now),
      endTime: toLocalInput(inOneDay),
      antiSnipeSeconds: '30',
    },
  });

  const mutation = useMutation({
    mutationFn: (values: FormValues) => {
      const startingPrice = Number(values.startingPrice);
      const buyNowPrice = values.buyNowPrice ? Number(values.buyNowPrice) : undefined;
      const reservePrice = values.reservePrice ? Number(values.reservePrice) : undefined;
      // Light client-side guards; the server is the authoritative validator.
      if (buyNowPrice != null && buyNowPrice <= startingPrice) {
        throw new Error('Direct buy price must be greater than the starting price');
      }
      if (new Date(values.endTime) <= new Date(values.startTime)) {
        throw new Error('End time must be after the start time');
      }
      return auctionsService.create({
        vehicleId: vehicle!.id,
        startingPrice,
        reservePrice,
        buyNowPrice,
        bidIncrement: values.bidIncrement ? Number(values.bidIncrement) : 500,
        startTime: new Date(values.startTime).toISOString(),
        endTime: new Date(values.endTime).toISOString(),
        antiSnipeSeconds: values.antiSnipeSeconds ? Number(values.antiSnipeSeconds) : 30,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-listings'] });
      qc.invalidateQueries({ queryKey: ['admin-vehicles'] });
      qc.invalidateQueries({ queryKey: ['auctions'] });
      toast('Auction created', 'success');
      reset();
      onCreated?.();
      onClose();
    },
    onError: (e) => toast(e instanceof Error ? e.message : getApiErrorMessage(e), 'error'),
  });

  return (
    <Modal open={!!vehicle} onClose={onClose} title="Create auction" size="md">
      {vehicle && <p className="-mt-2 mb-4 text-sm text-ink-muted">For <strong>{vehicle.title}</strong></p>}
      <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className="space-y-4" noValidate>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Starting price (₹)"
            type="number"
            error={errors.startingPrice?.message}
            {...register('startingPrice', { required: 'Required' })}
          />
          <Input label="Bid increment (₹)" type="number" {...register('bidIncrement')} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Reserve price (₹, optional)" type="number" hint="Hidden minimum to sell" {...register('reservePrice')} />
          <Input
            label="Direct buy price (₹, optional)"
            type="number"
            hint="Let buyers purchase instantly. Leave blank to disable."
            error={errors.buyNowPrice?.message}
            {...register('buyNowPrice')}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Start time" type="datetime-local" error={errors.startTime?.message} {...register('startTime', { required: 'Required' })} />
          <Input label="End time" type="datetime-local" error={errors.endTime?.message} {...register('endTime', { required: 'Required' })} />
        </div>
        <Input label="Anti-snipe window (seconds)" type="number" hint="A bid in the final seconds extends the auction by this much" {...register('antiSnipeSeconds')} />

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={mutation.isPending}>
            <Gavel className="h-4 w-4" /> Create auction
          </Button>
        </div>
      </form>
    </Modal>
  );
}
