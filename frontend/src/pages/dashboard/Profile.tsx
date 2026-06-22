import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { usersService } from '@/services/misc.service';
import { useAuthStore } from '@/store/auth';
import { useToast } from '@/components/ui/Toast';
import { getApiErrorMessage } from '@/lib/api';
import { Input } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';

export default function Profile() {
  const { user, setUser } = useAuthStore();
  const toast = useToast();

  const profileForm = useForm({ defaultValues: { name: user?.name ?? '', phone: user?.phone ?? '', avatarUrl: user?.avatarUrl ?? '' } });
  const passwordForm = useForm({ defaultValues: { currentPassword: '', newPassword: '' } });

  const updateProfile = useMutation({
    mutationFn: usersService.updateProfile,
    onSuccess: (u) => {
      setUser(u);
      toast('Profile updated', 'success');
    },
    onError: (e) => toast(getApiErrorMessage(e), 'error'),
  });

  const changePassword = useMutation({
    mutationFn: usersService.changePassword,
    onSuccess: () => {
      toast('Password changed', 'success');
      passwordForm.reset();
    },
    onError: (e) => toast(getApiErrorMessage(e), 'error'),
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold">Profile</h1>

      <section className="card p-6">
        <h2 className="font-bold">Personal information</h2>
        <form onSubmit={profileForm.handleSubmit((v) => updateProfile.mutate(v))} className="mt-4 space-y-4" noValidate>
          <Input label="Full name" {...profileForm.register('name', { required: true })} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Phone" {...profileForm.register('phone')} />
            <Input label="Email" value={user?.email ?? ''} disabled hint="Email cannot be changed." />
          </div>
          <Input label="Avatar URL" placeholder="https://…" {...profileForm.register('avatarUrl')} />
          <div className="flex justify-end">
            <Button type="submit" loading={updateProfile.isPending}>Save changes</Button>
          </div>
        </form>
      </section>

      <section className="card p-6">
        <h2 className="font-bold">Change password</h2>
        <form onSubmit={passwordForm.handleSubmit((v) => changePassword.mutate(v))} className="mt-4 space-y-4" noValidate>
          <Input label="Current password" type="password" {...passwordForm.register('currentPassword', { required: 'Required' })} error={passwordForm.formState.errors.currentPassword?.message} />
          <Input
            label="New password"
            type="password"
            hint="At least 8 characters with a letter and a number."
            {...passwordForm.register('newPassword', {
              required: 'Required',
              minLength: { value: 8, message: 'At least 8 characters' },
              validate: (v) => (/[A-Za-z]/.test(v) && /[0-9]/.test(v)) || 'Include a letter and a number',
            })}
            error={passwordForm.formState.errors.newPassword?.message}
          />
          <div className="flex justify-end">
            <Button type="submit" variant="dark" loading={changePassword.isPending}>Update password</Button>
          </div>
        </form>
      </section>
    </div>
  );
}
