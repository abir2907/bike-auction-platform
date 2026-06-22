import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { LayoutGrid, List, SlidersHorizontal, SearchX } from 'lucide-react';
import { clsx } from 'clsx';
import { vehiclesService, VehicleFilters } from '@/services/vehicles.service';
import { VehicleCard, VehicleCardSkeleton } from '@/components/vehicles/VehicleCard';
import { FilterPanel, Filters, EMPTY_FILTERS } from '@/components/vehicles/FilterPanel';
import { Pagination } from '@/components/ui/Pagination';
import { EmptyState } from '@/components/ui/Misc';
import { Select } from '@/components/ui/Field';
import { useSaved } from '@/hooks/useSaved';

const sortOptions = [
  { value: 'newest', label: 'Newest first' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'year_desc', label: 'Year: Newest' },
  { value: 'km_asc', label: 'Mileage: Lowest' },
  { value: 'popular', label: 'Most viewed' },
];

export default function ListingsPage() {
  const [params, setParams] = useSearchParams();
  const { savedIds, toggle } = useSaved();

  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState<Filters>({
    ...EMPTY_FILTERS,
    q: params.get('q') || '',
    brand: params.get('brand') || '',
    fuelType: params.get('fuelType') || '',
    listingType: params.get('listingType') || '',
  });
  const [sort, setSort] = useState(params.get('sort') || 'newest');
  const [page, setPage] = useState(Number(params.get('page')) || 1);

  // Keep the URL in sync so listing searches are shareable/bookmarkable.
  useEffect(() => {
    const next = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => v && next.set(k, v));
    if (sort !== 'newest') next.set('sort', sort);
    if (page > 1) next.set('page', String(page));
    setParams(next, { replace: true });
  }, [filters, sort, page, setParams]);

  const queryParams: VehicleFilters = useMemo(
    () => ({
      q: filters.q || undefined,
      brand: filters.brand || undefined,
      fuelType: filters.fuelType || undefined,
      listingType: filters.listingType || undefined,
      minPrice: filters.minPrice ? Number(filters.minPrice) : undefined,
      maxPrice: filters.maxPrice ? Number(filters.maxPrice) : undefined,
      minYear: filters.minYear ? Number(filters.minYear) : undefined,
      maxYear: filters.maxYear ? Number(filters.maxYear) : undefined,
      sort,
      page,
      limit: 12,
    }),
    [filters, sort, page],
  );

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['vehicles', queryParams],
    queryFn: () => vehiclesService.list(queryParams),
    placeholderData: keepPreviousData,
  });

  const patchFilters = (patch: Partial<Filters>) => {
    setFilters((f) => ({ ...f, ...patch }));
    setPage(1);
  };
  const reset = () => {
    setFilters(EMPTY_FILTERS);
    setPage(1);
  };

  return (
    <div className="bg-surface">
      <div className="container-page py-8">
        <header className="mb-6">
          <h1 className="text-3xl font-extrabold">Browse bikes</h1>
          <p className="mt-1 text-ink-muted">
            {data?.meta ? `${data.meta.total} bikes available` : 'Find your perfect pre-owned two-wheeler'}
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          {/* Sidebar (desktop) */}
          <aside className={clsx('lg:block', showFilters ? 'block' : 'hidden')}>
            <div className="lg:sticky lg:top-24">
              <FilterPanel value={filters} onChange={patchFilters} onReset={reset} />
            </div>
          </aside>

          <div>
            {/* Toolbar */}
            <div className="card mb-5 flex flex-wrap items-center justify-between gap-3 p-3">
              <button onClick={() => setShowFilters((s) => !s)} className="btn-outline btn-sm lg:hidden">
                <SlidersHorizontal className="h-4 w-4" /> Filters
              </button>
              <div className="ml-auto flex items-center gap-3">
                <div className="w-48">
                  <Select
                    aria-label="Sort by"
                    value={sort}
                    onChange={(e) => {
                      setSort(e.target.value);
                      setPage(1);
                    }}
                    options={sortOptions}
                  />
                </div>
                <div className="hidden items-center gap-1 rounded-xl border border-line p-1 sm:flex">
                  <button
                    onClick={() => setView('grid')}
                    className={clsx('rounded-lg p-2', view === 'grid' ? 'bg-brand text-white' : 'text-ink-muted')}
                    aria-label="Grid view"
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setView('list')}
                    className={clsx('rounded-lg p-2', view === 'list' ? 'bg-brand text-white' : 'text-ink-muted')}
                    aria-label="List view"
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Results */}
            {isLoading ? (
              <div className={clsx('grid gap-5', view === 'grid' ? 'sm:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1')}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <VehicleCardSkeleton key={i} view={view} />
                ))}
              </div>
            ) : !data?.items.length ? (
              <EmptyState
                icon={<SearchX className="h-7 w-7" />}
                title="No bikes match your filters"
                description="Try widening your price range or clearing some filters."
              />
            ) : (
              <div className={clsx('relative grid gap-5 transition-opacity', isFetching && 'opacity-60', view === 'grid' ? 'sm:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1')}>
                {data.items.map((v) => (
                  <VehicleCard key={v.id} vehicle={v} view={view} saved={savedIds.has(v.id)} onToggleSave={toggle} />
                ))}
              </div>
            )}

            {data?.meta && (
              <div className="mt-10">
                <Pagination page={page} totalPages={data.meta.totalPages} onChange={setPage} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
