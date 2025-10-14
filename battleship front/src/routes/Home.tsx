import { Link } from "react-router-dom";
import { loadAuth } from "../services/auth";

export default function Home() {
  const auth = loadAuth();
  const isAuthed = !!auth;

  return (
    <div className="relative">
      {/* Decorative background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-sky-50 to-white dark:from-slate-900 dark:to-slate-950" />
        <div className="pointer-events-none absolute inset-x-0 top-0 mx-auto h-48 bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.15),transparent_60%)] dark:bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.15),transparent_60%)]" />
      </div>

      {/* Hero */}
      <section className="py-10 sm:py-14">
        <div className="mx-auto max-w-5xl px-4">
          <div className="flex flex-col items-center text-center">
            <img
              src="/logo.svg"
              alt="SeaStrike"
              className="h-14 w-14 sm:h-16 sm:w-16 mb-3 drop-shadow"
            />
            <h1 className="text-3xl sm:text-5xl font-bold tracking-tight">
              SeaStrike
            </h1>
            <p className="mt-3 max-w-2xl text-slate-600 dark:text-slate-300 text-base sm:text-lg">
              Command your fleet. Outsmart your rival. Sink every last ship.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              {isAuthed ? (
                <>
                  <Link
                    to="/lobby"
                    className="inline-flex items-center gap-2 rounded-lg bg-blue-600 text-white px-5 py-2.5 text-sm sm:text-base font-semibold shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    Go to Lobby
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/signup"
                    className="inline-flex items-center gap-2 rounded-lg bg-blue-600 text-white px-5 py-2.5 text-sm sm:text-base font-semibold shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    Sign up free
                  </Link>
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white text-slate-800 px-5 py-2.5 text-sm sm:text-base font-semibold shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
                  >
                    Log in
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-6 sm:py-10">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            <Feature
              title="Tactical deployment"
              desc="Place all 5 ships with live previews. Rotate with R, reposition instantly, deny overlaps."
              icon={<ShipIcon />}
            />
            <Feature
              title="Battle clarity"
              desc="Satisfying hit pops, ripples on misses, and a bold result badge on the enemy board."
              icon={<TargetIcon />}
            />
            <Feature
              title="Night ops"
              desc="A refined dark theme tuned for contrast across boards, toasts, lobbies, and modals."
              icon={<MoonIcon />}
            />
          </div>
        </div>
      </section>

      {/* How to play */}
      <section className="py-6 sm:py-10">
        <div className="mx-auto max-w-5xl px-4">
          <div className="rounded-xl border border-slate-200 bg-white/70 backdrop-blur dark:border-slate-700 dark:bg-slate-900/60 p-5 sm:p-6">
            <h2 className="text-xl font-semibold mb-3">How to play</h2>
            <ol className="space-y-2 text-slate-700 dark:text-slate-300">
              <li>1) Enter the lobby and create or join a match.</li>
              <li>
                2) Deploy your 5 ships. Green cells are valid, red are blocked.
                Press R to rotate.
              </li>
              <li>
                3) Take turns calling shots. Track hits, sink fleets, and claim
                victory.
              </li>
            </ol>
          </div>
        </div>
      </section>
    </div>
  );
}

function Feature({
  title,
  desc,
  icon,
}: {
  title: string;
  desc: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 p-4 sm:p-5 flex gap-3">
      <div className="shrink-0 mt-1 text-blue-600 dark:text-blue-400">
        {icon}
      </div>
      <div>
        <div className="font-semibold mb-1">{title}</div>
        <div className="text-sm text-slate-600 dark:text-slate-300">{desc}</div>
      </div>
    </div>
  );
}

function ShipIcon() {
  return (
    <svg
      className="w-6 h-6"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M4 16l8-10 8 10H4z" opacity=".6" />
      <path d="M3 18h18v2H3z" />
    </svg>
  );
}

function TargetIcon() {
  return (
    <svg
      className="w-6 h-6"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <circle cx="12" cy="12" r="9" opacity=".3" />
      <circle cx="12" cy="12" r="5" opacity=".6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      className="w-6 h-6"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
    </svg>
  );
}
