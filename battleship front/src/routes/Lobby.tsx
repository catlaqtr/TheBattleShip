import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import type { GameSummary } from '../types';

export default function Lobby() {
  const qc = useQueryClient();
  const gamesQ = useQuery({
    queryKey: ['games'],
    queryFn: async () => (await api.get('/games')) as GameSummary[],
  });

  const createGame = useMutation({
    mutationFn: async () => (await api.post('/games')) as GameSummary,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['games'] }),
  });

  const joinGame = useMutation({
    mutationFn: async (id: number) => (await api.post(`/games/${id}/join`)) as GameSummary,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['games'] }),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Lobby</h2>
        <Button variant="secondary" onClick={() => createGame.mutate()}>
          New Game
        </Button>
      </div>
      {gamesQ.isLoading && <div>Loading games…</div>}
      {gamesQ.data && (
        <Card>
          <CardContent className="p-0">
            <ul className="divide-y divide-slate-200 dark:divide-slate-700">
              {gamesQ.data.map((g: GameSummary) => (
                <li
                  key={g.gameId}
                  className="p-3 flex items-center justify-between text-slate-800 dark:text-slate-100"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-medium">#{g.gameId}</span>
                    <Badge
                      tone={
                        g.status === 'IN_PROGRESS'
                          ? 'info'
                          : g.status === 'PLACING'
                            ? 'warning'
                            : 'neutral'
                      }
                    >
                      {g.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/game/${g.gameId}`}
                      className="px-3 py-1 rounded border border-slate-300 hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-800"
                    >
                      Open
                    </Link>
                    {!g.player2Id && (
                      <Button variant="outline" size="sm" onClick={() => joinGame.mutate(g.gameId)}>
                        Join
                      </Button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
