import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersService } from '@/services/misc.service';
import { useAuthStore } from '@/store/auth';
import { useToast } from '@/components/ui/Toast';

/**
 * Centralises "saved bikes" state: the set of saved ids plus an optimistic
 * toggle. No-ops gracefully for logged-out users (prompts via toast).
 */
export function useSaved() {
  const { status, user } = useAuthStore();
  const qc = useQueryClient();
  const toast = useToast();
  const isAdmin = user?.role === 'ADMIN';
  // Admins are staff, not buyers — they don't save bikes.
  const enabled = status === 'authenticated' && !isAdmin;

  const { data: saved = [] } = useQuery({
    queryKey: ['saved'],
    queryFn: usersService.saved,
    enabled,
  });

  const savedIds = new Set(saved.map((v) => v.id));

  const mutation = useMutation({
    mutationFn: (vehicleId: string) => usersService.toggleSaved(vehicleId),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['saved'] });
      toast(res.saved ? 'Added to saved bikes' : 'Removed from saved bikes', 'success');
    },
    onError: () => toast('Could not update saved bikes', 'error'),
  });

  const toggle = (vehicleId: string) => {
    if (status !== 'authenticated') {
      toast('Log in to save bikes', 'info');
      return;
    }
    if (isAdmin) {
      toast('Admin accounts cannot save bikes', 'info');
      return;
    }
    mutation.mutate(vehicleId);
  };

  return { savedIds, toggle, saved, enabled };
}
