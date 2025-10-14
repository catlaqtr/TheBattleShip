import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '../services/api';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { signupSchema } from '../validation/auth';

export default function Signup() {
  const navigate = useNavigate();
  type FormData = z.infer<typeof signupSchema>;
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<FormData>({
    resolver: zodResolver(signupSchema),
    mode: 'onSubmit',
  });

  const onSubmit = async (values: FormData) => {
    try {
      await api.post(
        '/users',
        {
          username: values.username,
          email: values.email,
          password: values.password,
        },
        { public: true }
      );
      navigate('/login');
    } catch (err: unknown) {
      const msg = (err as Error)?.message || 'Signup failed';
      if (/email/i.test(msg)) setError('email', { type: 'server', message: msg });
      else if (/user/i.test(msg)) setError('username', { type: 'server', message: msg });
      else setError('password', { type: 'server', message: msg });
    }
  };

  return (
    <div className="min-h-[70vh] grid place-items-center">
      <div className="w-full max-w-md">
        <div className="text-center mb-4">
          <img src="/logo.svg" alt="SeaStrike" className="h-10 w-10 mx-auto mb-2" />
          <h1 className="text-2xl font-bold">Create your account</h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            Join SeaStrike and start playing
          </p>
        </div>
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Sign up</h2>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm mb-1">Username</label>
                <input
                  className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="yourname"
                  {...register('username')}
                />
                {errors.username && (
                  <p className="text-rose-600 text-sm mt-1">{errors.username.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm mb-1">Email</label>
                <input
                  className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="you@example.com"
                  type="email"
                  {...register('email')}
                />
                {errors.email && (
                  <p className="text-rose-600 text-sm mt-1">{errors.email.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm mb-1">Password</label>
                <input
                  className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="••••••••"
                  type="password"
                  {...register('password')}
                />
                {errors.password && (
                  <p className="text-rose-600 text-sm mt-1">{errors.password.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm mb-1">Confirm Password</label>
                <input
                  className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="••••••••"
                  type="password"
                  {...register('confirmPassword')}
                />
                {errors.confirmPassword && (
                  <p className="text-rose-600 text-sm mt-1">{errors.confirmPassword.message}</p>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Creating…' : 'Create account'}
              </Button>
              <p className="text-sm text-center text-slate-600 dark:text-slate-300">
                Already have an account?{' '}
                <a className="text-blue-600 hover:underline" href="/login">
                  Log in
                </a>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
