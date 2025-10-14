import { useQuery } from '@tanstack/react-query';
import { gameApi } from '../services/gameApi';
import type { ShipView, ShotView } from '../types';

export function useBoardData(
  gameId: number | undefined,
  boardId: number | undefined,
  options?: { fetchShips?: boolean; fetchShots?: boolean }
) {
  const fetchShips = options?.fetchShips !== false;
  const fetchShots = options?.fetchShots !== false;
  const retryUnless403 = (failureCount: number, error: unknown) => {
    const status = (error as { status?: number })?.status;
    if (status === 403) return false;
    return failureCount < 3;
  };

  const ships = useQuery<ShipView[]>({
    queryKey: ['ships', gameId, boardId],
    queryFn: () => gameApi.getShips(boardId!),
    enabled: !!gameId && !!boardId && fetchShips,
    retry: retryUnless403,
    refetchInterval: 5000,
    refetchIntervalInBackground: false,
  });

  const shots = useQuery<ShotView[]>({
    queryKey: ['shots', gameId, boardId],
    queryFn: () => gameApi.getShots(gameId!, boardId!),
    enabled: !!gameId && !!boardId && fetchShots,
    retry: retryUnless403,
    refetchInterval: 4000,
    refetchIntervalInBackground: false,
  });

  return { ships, shots };
}
