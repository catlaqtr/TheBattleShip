import { StrictMode, Suspense, lazy } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
const Login = lazy(() => import('./routes/Login'));
const Signup = lazy(() => import('./routes/Signup'));
const Lobby = lazy(() => import('./routes/Lobby'));
const Game = lazy(() => import('./routes/Game'));
const Home = lazy(() => import('./routes/Home'));
import RequireAuth from './components/RequireAuth';
import { ToastProvider } from './components/ui/toast/ToastProvider';
import Toaster from './components/ui/toast/Toaster';

const queryClient = new QueryClient();

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<div className="p-4">Loading…</div>}>
            <Home />
          </Suspense>
        ),
      },
      {
        path: 'login',
        element: (
          <Suspense fallback={<div className="p-4">Loading…</div>}>
            <Login />
          </Suspense>
        ),
      },
      {
        path: 'signup',
        element: (
          <Suspense fallback={<div className="p-4">Loading…</div>}>
            <Signup />
          </Suspense>
        ),
      },
      {
        path: 'lobby',
        element: (
          <RequireAuth>
            <Suspense fallback={<div className="p-4">Loading…</div>}>
              <Lobby />
            </Suspense>
          </RequireAuth>
        ),
      },
      {
        path: 'game/:id',
        element: (
          <RequireAuth>
            <Suspense fallback={<div className="p-4">Loading…</div>}>
              <Game />
            </Suspense>
          </RequireAuth>
        ),
      },
    ],
  },
]);

export default function Root() {
  return (
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <RouterProvider router={router} />
          <Toaster />
        </ToastProvider>
      </QueryClientProvider>
    </StrictMode>
  );
}
