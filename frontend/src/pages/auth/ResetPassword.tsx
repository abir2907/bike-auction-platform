import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { authService } from '@/services/auth.service';
import { getApiErrorMessage } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';
import { Input } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';

export default function ResetPasswordPage() {
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const navigate = useNavigate();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, watch, formState: { errors } } = useForm<{ password: string; confirm: string }>();

  const onSubmit = async ({ password }: { password: string }) => {
    setLoading(true);
    try {
      await authService.resetPassword(token, password);
      toast('Password updated. Please log in.', 'success');
      navigate('/login', { replace: true });
    } catch (err) {
      toast(getApiErrorMessage(err, 'This reset link is invalid or expired'), 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-extrabold">Invalid reset link</h1>
        <p className="mt-2 text-ink-muted">This link is missing its token. Please request a new one.</p>
        <Link to="/forgot-password" className="btn-primary mt-6 inline-flex">
          Request new link
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-extrabold">Set a new password</h1>
      <p className="mt-2 text-ink-muted">Choose a strong password you haven't used before.</p>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4" noValidate>
        <Input
          label="New password"
          type="password"
          error={errors.password?.message}
          {...register('password', {
            required: 'Password is required',
            minLength: { value: 8, message: 'At least 8 characters' },
            validate: (v) => (/[A-Za-z]/.test(v) && /[0-9]/.test(v)) || 'Include a letter and a number',
          })}
        />
        <Input
          label="Confirm password"
          type="password"
          error={errors.confirm?.message}
          {...register('confirm', { validate: (v) => v === watch('password') || 'Passwords do not match' })}
        />
        <Button type="submit" fullWidth loading={loading} size="lg">
          Update password
        </Button>
      </form>
    </div>
  );
}
