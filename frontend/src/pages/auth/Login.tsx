import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '@/store/auth';
import { useToast } from '@/components/ui/Toast';
import { getApiErrorMessage } from '@/lib/api';
import { Input } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';

interface FormValues {
  email: string;
  password: string;
}

export default function LoginPage() {
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const from = (location.state as { from?: string })?.from || '/dashboard';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>();

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    try {
      const user = await login(values.email, values.password);
      toast(`Welcome back, ${user.name.split(' ')[0]}!`, 'success');
      navigate(user.role === 'ADMIN' ? '/admin' : from, { replace: true });
    } catch (err) {
      toast(getApiErrorMessage(err, 'Invalid email or password'), 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-extrabold">Welcome back</h1>
      <p className="mt-2 text-ink-muted">Log in to bid, buy and manage your listings.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4" noValidate>
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register('email', { required: 'Email is required' })}
        />
        <div>
          <Input
            label="Password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            error={errors.password?.message}
            {...register('password', { required: 'Password is required' })}
          />
          <div className="mt-1.5 text-right">
            <Link to="/forgot-password" className="text-sm font-semibold text-brand hover:underline">
              Forgot password?
            </Link>
          </div>
        </div>
        <Button type="submit" fullWidth loading={loading} size="lg">
          Log in
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-muted">
        New to Vutto Auctions?{' '}
        <Link to="/register" className="font-semibold text-brand hover:underline">
          Create an account
        </Link>
      </p>

      <div className="mt-8 rounded-xl border border-line bg-surface p-4 text-xs text-ink-muted">
        <p className="font-semibold text-ink-soft">Demo accounts</p>
        <p className="mt-1">Buyer: buyer@vutto.local · Admin: admin@vutto.local</p>
        <p>Passwords: Password@123 / Admin@12345</p>
      </div>
    </div>
  );
}
