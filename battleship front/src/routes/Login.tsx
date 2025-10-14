import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '../services/api';
import { saveAuth, type AuthResponse } from '../services/auth';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { loginSchema } from '../validation/auth';

export default function Login() {
  const navigate = useNavigate();
  type FormData = z.infer<typeof loginSchema>;
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<FormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onSubmit',
  });

  const onSubmit = async (values: FormData) => {
    try {
      const data = (await api.post('/auth/login', values, { public: true })) as AuthResponse;
      saveAuth(data);
      navigate('/lobby');
    } catch (err: unknown) {
      const message = (err as Error)?.message || 'Login failed';
      setError('password', { type: 'server', message });
    }
  };

  return (
    <div className="min-h-[70vh] grid place-items-center">
      <div className="w-full max-w-md">
        <div className="text-center mb-4">
          <img src="/logo.svg" alt="SeaStrike" className="h-10 w-10 mx-auto mb-2" />
          <h1 className="text-2xl font-bold">Welcome back</h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Sign in to continue</p>
        </div>
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Sign in</h2>
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
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Signing in…' : 'Sign in'}
              </Button>
              <p className="text-sm text-center text-slate-600 dark:text-slate-300">
                Don't have an account?{' '}
                <a className="text-blue-600 hover:underline" href="/signup">
                  Sign up
                </a>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
