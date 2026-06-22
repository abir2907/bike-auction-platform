import { X } from 'lucide-react';
import { Select } from '@/components/ui/Field';

export interface Filters {
  q: string;
  brand: string;
  fuelType: string;
  listingType: string;
  minPrice: string;
  maxPrice: string;
  minYear: string;
  maxYear: string;
}

export const EMPTY_FILTERS: Filters = {
  q: '', brand: '', fuelType: '', listingType: '', minPrice: '', maxPrice: '', minYear: '', maxYear: '',
};

const brands = ['Royal Enfield', 'Honda', 'Bajaj', 'Yamaha', 'TVS', 'KTM', 'Hero', 'Suzuki', 'Kawasaki', 'Ather', 'Ola'];
const years = Array.from({ length: 16 }, (_, i) => String(new Date().getFullYear() - i));

interface Props {
  value: Filters;
  onChange: (patch: Partial<Filters>) => void;
  onReset: () => void;
}

export function FilterPanel({ value, onChange, onReset }: Props) {
  const active = Object.entries(value).filter(([k, v]) => k !== 'q' && v).length;

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between">
        <h3 className="font-bold">Filters {active > 0 && <span className="badge-brand ml-1">{active}</span>}</h3>
        {active > 0 && (
          <button onClick={onReset} className="inline-flex items-center gap-1 text-sm font-semibold text-brand">
            <X className="h-3.5 w-3.5" /> Clear
          </button>
        )}
      </div>

      <div className="mt-5 space-y-4">
        <Select
          label="Listing type"
          value={value.listingType}
          onChange={(e) => onChange({ listingType: e.target.value })}
          options={[
            { value: '', label: 'All listings' },
            { value: 'SALE', label: 'Buy now' },
            { value: 'AUCTION', label: 'Auction' },
          ]}
        />
        <Select
          label="Brand"
          value={value.brand}
          onChange={(e) => onChange({ brand: e.target.value })}
          options={[{ value: '', label: 'All brands' }, ...brands.map((b) => ({ value: b, label: b }))]}
        />
        <Select
          label="Fuel type"
          value={value.fuelType}
          onChange={(e) => onChange({ fuelType: e.target.value })}
          options={[
            { value: '', label: 'Any fuel' },
            { value: 'PETROL', label: 'Petrol' },
            { value: 'ELECTRIC', label: 'Electric' },
            { value: 'HYBRID', label: 'Hybrid' },
          ]}
        />

        <div>
          <label className="label">Price range (₹)</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder="Min"
              value={value.minPrice}
              onChange={(e) => onChange({ minPrice: e.target.value })}
              className="input"
            />
            <span className="text-ink-muted">–</span>
            <input
              type="number"
              placeholder="Max"
              value={value.maxPrice}
              onChange={(e) => onChange({ maxPrice: e.target.value })}
              className="input"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Select
            label="Year from"
            value={value.minYear}
            onChange={(e) => onChange({ minYear: e.target.value })}
            options={[{ value: '', label: 'Any' }, ...years.map((y) => ({ value: y, label: y }))]}
          />
          <Select
            label="Year to"
            value={value.maxYear}
            onChange={(e) => onChange({ maxYear: e.target.value })}
            options={[{ value: '', label: 'Any' }, ...years.map((y) => ({ value: y, label: y }))]}
          />
        </div>
      </div>
    </div>
  );
}
