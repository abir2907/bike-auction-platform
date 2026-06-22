import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ImagePlus, Trash2, Info } from 'lucide-react';
import { vehiclesService, VehicleWriteInput } from '@/services/vehicles.service';
import { useToast } from '@/components/ui/Toast';
import { getApiErrorMessage } from '@/lib/api';
import { Input, Select, Textarea } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { PageLoader } from '@/components/ui/Spinner';

type FormValues = Omit<VehicleWriteInput, 'images'>;

export default function ListingForm() {
  const { id } = useParams<{ id?: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();
  const toast = useToast();
  const qc = useQueryClient();

  const [images, setImages] = useState<string[]>([]);
  const [imageUrl, setImageUrl] = useState('');

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    defaultValues: {
      fuelType: 'PETROL',
      transmission: 'MANUAL',
      listingType: 'SALE',
      ownerCount: 1,
      year: new Date().getFullYear(),
    },
  });

  // For edit, hydrate from the user's own listings.
  const { data: mine, isLoading } = useQuery({
    queryKey: ['my-listings'],
    queryFn: vehiclesService.mine,
    enabled: isEdit,
  });

  useEffect(() => {
    if (isEdit && mine) {
      const v = mine.find((x) => x.id === id);
      if (v) {
        reset({
          title: v.title, brand: v.brand, model: v.model, variant: v.variant ?? '', year: v.year,
          fuelType: v.fuelType, transmission: v.transmission, kmDriven: v.kmDriven, ownerCount: v.ownerCount,
          engineCapacityCc: v.engineCapacityCc ?? undefined, color: v.color ?? '', registrationState: v.registrationState ?? '',
          city: v.city, description: v.description, price: Number(v.price), listingType: v.listingType,
        });
        setImages(v.images.map((i) => i.url));
      }
    }
  }, [isEdit, mine, id, reset]);

  const mutation = useMutation({
    mutationFn: (values: FormValues) => {
      const payload: VehicleWriteInput = {
        ...values,
        year: Number(values.year),
        kmDriven: Number(values.kmDriven),
        ownerCount: Number(values.ownerCount),
        price: Number(values.price),
        engineCapacityCc: values.engineCapacityCc ? Number(values.engineCapacityCc) : undefined,
        images: images.map((url, i) => ({ url, isPrimary: i === 0, sortOrder: i })),
      };
      return isEdit ? vehiclesService.update(id!, payload) : vehiclesService.create(payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-listings'] });
      toast(isEdit ? 'Listing updated' : 'Listing created', 'success');
      navigate('/dashboard/listings');
    },
    onError: (e) => toast(getApiErrorMessage(e), 'error'),
  });

  const addImage = () => {
    const url = imageUrl.trim();
    if (!url) return;
    setImages((imgs) => [...imgs, url]);
    setImageUrl('');
  };

  const onSubmit = (values: FormValues) => {
    if (images.length === 0) {
      toast('Add at least one image URL', 'error');
      return;
    }
    mutation.mutate(values);
  };

  if (isEdit && isLoading) return <PageLoader />;

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-extrabold">{isEdit ? 'Edit listing' : 'Create a listing'}</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <section className="card space-y-4 p-6">
          <h2 className="font-bold">Vehicle details</h2>
          <Input label="Listing title" placeholder="e.g. Royal Enfield Classic 350 (2021)" error={errors.title?.message} {...register('title', { required: 'Title is required', minLength: { value: 4, message: 'Too short' } })} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Brand" error={errors.brand?.message} {...register('brand', { required: 'Required' })} />
            <Input label="Model" error={errors.model?.message} {...register('model', { required: 'Required' })} />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <Input label="Variant (optional)" {...register('variant')} />
            <Input label="Year" type="number" error={errors.year?.message} {...register('year', { required: 'Required', valueAsNumber: true })} />
            <Input label="Color" {...register('color')} />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <Select label="Fuel type" {...register('fuelType')} options={[{ value: 'PETROL', label: 'Petrol' }, { value: 'ELECTRIC', label: 'Electric' }, { value: 'HYBRID', label: 'Hybrid' }]} />
            <Select label="Transmission" {...register('transmission')} options={[{ value: 'MANUAL', label: 'Manual' }, { value: 'AUTOMATIC', label: 'Automatic / Gearless' }]} />
            <Input label="Engine (cc)" type="number" {...register('engineCapacityCc')} />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <Input label="KM driven" type="number" error={errors.kmDriven?.message} {...register('kmDriven', { required: 'Required', valueAsNumber: true })} />
            <Select label="Ownership" {...register('ownerCount', { valueAsNumber: true })} options={[{ value: '1', label: '1st owner' }, { value: '2', label: '2nd owner' }, { value: '3', label: '3rd owner' }, { value: '4', label: '4+ owner' }]} />
            <Input label="Reg. state (e.g. DL)" {...register('registrationState')} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="City" error={errors.city?.message} {...register('city', { required: 'Required' })} />
            <Input label="Price (₹)" type="number" error={errors.price?.message} {...register('price', { required: 'Required', valueAsNumber: true })} />
          </div>
          <Textarea label="Description" rows={5} placeholder="Describe condition, service history, accessories…" error={errors.description?.message} {...register('description', { required: 'Required', minLength: { value: 20, message: 'At least 20 characters' } })} />
          <Select label="Listing type" {...register('listingType')} options={[{ value: 'SALE', label: 'Fixed price (Buy now)' }, { value: 'AUCTION', label: 'Auction (admin will schedule)' }]} />
        </section>

        <section className="card space-y-4 p-6">
          <h2 className="font-bold">Photos</h2>
          <div className="flex items-start gap-2 rounded-xl bg-brand-50 p-3 text-sm text-brand-700">
            <Info className="mt-0.5 h-4 w-4 shrink-0" />
            <p>Paste image URLs (e.g. from a CDN). The first image becomes the cover. For demo data you can use https://picsum.photos/seed/&lt;any&gt;/1024/768.</p>
          </div>
          <div className="flex gap-2">
            <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addImage())} placeholder="https://…/image.jpg" className="input" />
            <Button type="button" variant="outline" onClick={addImage}><ImagePlus className="h-4 w-4" /> Add</Button>
          </div>
          {images.length > 0 && (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
              {images.map((img, i) => (
                <div key={i} className="relative aspect-square overflow-hidden rounded-xl border border-line">
                  <img src={img} alt="" className="h-full w-full object-cover" />
                  {i === 0 && <span className="absolute left-1 top-1 badge-brand">Cover</span>}
                  <button type="button" onClick={() => setImages((imgs) => imgs.filter((_, x) => x !== i))} className="absolute right-1 top-1 grid h-7 w-7 place-items-center rounded-lg bg-white/90 text-danger shadow-soft">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={() => navigate('/dashboard/listings')}>Cancel</Button>
          <Button type="submit" loading={mutation.isPending} size="lg">{isEdit ? 'Save changes' : 'Publish listing'}</Button>
        </div>
      </form>
    </div>
  );
}
