import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useSaved } from '@/hooks/useSaved';
import { VehicleCard } from '@/components/vehicles/VehicleCard';
import { EmptyState } from '@/components/ui/Misc';

export default function SavedVehicles() {
  const { saved, savedIds, toggle } = useSaved();

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-extrabold">Saved bikes</h1>
      {saved.length === 0 ? (
        <EmptyState
          icon={<Heart className="h-7 w-7" />}
          title="No saved bikes yet"
          description="Tap the heart on any listing to save it here for later."
          action={<Link to="/buy" className="btn-primary mt-2">Browse bikes</Link>}
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {saved.map((v) => (
            <VehicleCard key={v.id} vehicle={v} saved={savedIds.has(v.id)} onToggleSave={toggle} />
          ))}
        </div>
      )}
    </div>
  );
}
