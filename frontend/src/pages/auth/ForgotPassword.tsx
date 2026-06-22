import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { MailCheck } from 'lucide-react';
import { authService } from '@/services/auth.service';
import { getApiErrorMessage } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';
import { Input } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const { register, handleSubmit, formState: { errors } } = useForm<{ email: string }>();

  const onSubmit = async ({ email }: { email: string }) => {
    setLoading(true);
    try {
      await authService.forgotPassword(email);
      setSent(true);
    } catch (err) {
      toast(getApiErrorMessage(err), 'error');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="text-center">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-success-soft text-success">
          <MailCheck className="h-7 w-7" />
        </div>
        <h1 className="mt-5 text-2xl font-extrabold">Check your inbox</h1>
        <p className="mt-2 text-ink-muted">
          If an account exists for that email, we've sent a link to reset your password. The link expires in 30 minutes.
        </p>
        <Link to="/login" className="btn-outline mt-6 inline-flex">
          Back to login
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-extrabold">Forgot password?</h1>
      <p className="mt-2 text-ink-muted">Enter your email and we'll send you a reset link.</p>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4" noValidate>
        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register('email', { required: 'Email is required' })}
        />
        <Button type="submit" fullWidth loading={loading} size="lg">
          Send reset link
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-ink-muted">
        Remembered it?{' '}
        <Link to="/login" className="font-semibold text-brand hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
