import { Outlet, Link, useNavigate } from 'react-router-dom';
import { clearAuth, loadAuth } from './services/auth';
import ThemeToggle from './components/ui/ThemeToggle';
import { Button } from './components/ui/Button';

export default function App() {
  const auth = loadAuth();
  const navigate = useNavigate();
  const logout = () => {
    clearAuth();
    navigate('/login');
  };
  return (
    <div className="min-h-full">
      <header className="sticky top-0 z-10 backdrop-blur supports-[backdrop-filter]:bg-white bg-white border-b border-slate-300 dark:supports-[backdrop-filter]:bg-slate-900 dark:bg-slate-900 dark:border-slate-800">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <img src="/logo.svg" className="h-6 w-6" alt="SeaStrike logo" />
              <span className="text-lg sm:text-xl font-semibold tracking-tight">SeaStrike</span>
            </Link>
            <nav className="flex items-center gap-3 text-sm text-slate-800 dark:text-slate-100">
              <Link
                to="/lobby"
                className="px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Lobby
              </Link>
              {!auth ? (
                <>
                  <Link
                    to="/login"
                    className="px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    Sign up
                  </Link>
                </>
              ) : (
                <>
                  <span className="hidden sm:inline text-slate-700 dark:text-slate-200">
                    {auth.user.username}
                  </span>
                  <Button variant="danger" size="sm" onClick={logout}>
                    Logout
                  </Button>
                </>
              )}
              <ThemeToggle />
            </nav>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl p-4">
        <Outlet />
      </main>
    </div>
  );
}
