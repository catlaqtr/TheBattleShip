import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { gameApi } from '../services/gameApi';
import BoardGrid, { type CellState } from '../components/BoardGrid';
import { ShipPlacementPanel } from '../components/ShipPlacementPanel';
import { useBoardData } from '../hooks/useBoardData';
import { loadAuth } from '../services/auth';
import type { ShipView, ShotView } from '../types';
import { useToast } from '../components/ui/toast/ToastContext';

export default function Game() {
  const { id } = useParams();
  const gameId = Number(id);
  const qc = useQueryClient();
  const toast = useToast();

  const gameQ = useQuery({
    queryKey: ['game', gameId],
    queryFn: () => gameApi.getGame(gameId),
    enabled: Number.isFinite(gameId),
    refetchInterval: 3000,
  });

  const boardsQ = useQuery({
    queryKey: ['boards', gameId],
    queryFn: () => gameApi.getBoards(gameId),
    enabled: Number.isFinite(gameId),
    refetchInterval: 3000,
  });

  const shootM = useMutation({
    mutationFn: ({ row, col }: { row: number; col: number }) => gameApi.shoot(gameId, { row, col }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['game', gameId] });
      qc.invalidateQueries({ queryKey: ['boards', gameId] });
    },
  });

  const size = 10;
  const auth = loadAuth();
  const myUserId = auth?.user.id;

  const myBoard = boardsQ.data?.find((b) => b.ownerUserId === myUserId);
  const oppBoard = boardsQ.data?.find((b) => b.ownerUserId !== myUserId);

  const mySize = myBoard?.size ?? size;
  const oppSize = oppBoard?.size ?? size;

  const status = gameQ.data?.status;
  const allowShots = status === 'IN_PROGRESS' || status === 'FINISHED';

  const myData = useBoardData(gameId, myBoard?.id, {
    fetchShips: !!myBoard && myBoard.ownerUserId === myUserId,
    fetchShots: !!myBoard && allowShots,
  });
  const oppData = useBoardData(gameId, oppBoard?.id, {
    fetchShips: false,
    fetchShots: !!oppBoard && allowShots,
  });

  const [selectedType, setSelectedType] = useState<
    'CARRIER' | 'BATTLESHIP' | 'CRUISER' | 'SUBMARINE' | 'DESTROYER' | null
  >(null);
  const [orientation, setOrientation] = useState<'HORIZONTAL' | 'VERTICAL'>('HORIZONTAL');
  type Placement = {
    type: 'CARRIER' | 'BATTLESHIP' | 'CRUISER' | 'SUBMARINE' | 'DESTROYER';
    startRow: number;
    startCol: number;
    orientation: 'HORIZONTAL' | 'VERTICAL';
  };
  const [planned, setPlanned] = useState<Placement[]>([]);
  const [hoverCell, setHoverCell] = useState<{ r: number; c: number } | null>(null);

  const typeLength = useCallback((t: Placement['type']) => {
    switch (t) {
      case 'CARRIER':
        return 5;
      case 'BATTLESHIP':
        return 4;
      case 'CRUISER':
      case 'SUBMARINE':
        return 3;
      case 'DESTROYER':
        return 2;
    }
  }, []);

  const plannedCells = useMemo(() => {
    const set = new Set<string>();
    for (const s of planned) {
      const len = typeLength(s.type);
      for (let i = 0; i < len; i++) {
        const rr = s.orientation === 'HORIZONTAL' ? s.startRow : s.startRow + i;
        const cc = s.orientation === 'HORIZONTAL' ? s.startCol + i : s.startCol;
        set.add(`${rr}:${cc}`);
      }
    }
    return set;
  }, [planned, typeLength]);

  const isWithinBounds = useCallback(
    (boardSize: number, p: Placement) => {
      const len = typeLength(p.type);
      if (p.orientation === 'HORIZONTAL') {
        return (
          p.startRow >= 0 &&
          p.startRow < boardSize &&
          p.startCol >= 0 &&
          p.startCol + len - 1 < boardSize
        );
      } else {
        return (
          p.startCol >= 0 &&
          p.startCol < boardSize &&
          p.startRow >= 0 &&
          p.startRow + len - 1 < boardSize
        );
      }
    },
    [typeLength]
  );

  const overlapsPlanned = useCallback(
    (p: Placement) => {
      const len = typeLength(p.type);
      for (let i = 0; i < len; i++) {
        const rr = p.orientation === 'HORIZONTAL' ? p.startRow : p.startRow + i;
        const cc = p.orientation === 'HORIZONTAL' ? p.startCol + i : p.startCol;
        if (plannedCells.has(`${rr}:${cc}`)) return true;
      }
      return false;
    },
    [plannedCells, typeLength]
  );

  const previewMap = useMemo(() => {
    if (!selectedType || hoverCell == null) return undefined;
    const p: Placement = {
      type: selectedType,
      startRow: hoverCell.r,
      startCol: hoverCell.c,
      orientation,
    };
    const valid = isWithinBounds(mySize, p) && !overlapsPlanned(p);
    const map: Record<string, 'valid' | 'invalid'> = {};
    const len = typeLength(p.type);
    for (let i = 0; i < len; i++) {
      const r = orientation === 'HORIZONTAL' ? hoverCell.r : hoverCell.r + i;
      const c = orientation === 'HORIZONTAL' ? hoverCell.c + i : hoverCell.c;
      map[`${r}:${c}`] = valid ? 'valid' : 'invalid';
    }
    return map;
  }, [selectedType, hoverCell, orientation, mySize, overlapsPlanned, typeLength, isWithinBounds]);

  const placeShipsM = useMutation({
    mutationFn: async () => {
      if (!myBoard?.id) return;
      if (planned.length !== 5) throw new Error('You must place exactly 5 ships.');
      if (myBoard.ownerUserId !== myUserId) return;
      return gameApi.placeShips(gameId, myBoard.id, planned);
    },
    onSuccess: () => {
      setPlanned([]);
      setSelectedType(null);
      qc.invalidateQueries({ queryKey: ['ships', gameId, myBoard?.id] });
      qc.invalidateQueries({ queryKey: ['game', gameId] });
      toast.show({
        title: 'Ships placed',
        description: 'Waiting for opponent…',
        tone: 'success',
      });
    },
    onError: (err: unknown) => {
      const message = (err as Error)?.message || 'Request failed';
      console.error('Place ships failed:', message, err);
      toast.show({
        title: 'Could not place ships',
        description: message,
        tone: 'danger',
      });
    },
  });

  function buildCells(
    boardSize: number,
    ships: ShipView[] | undefined,
    shots: ShotView[] | undefined,
    opts: { own: boolean }
  ) {
    const grid: CellState[][] = Array.from({ length: boardSize }, () =>
      Array(boardSize).fill('empty')
    );
    if (opts.own && ships) {
      for (const s of ships) {
        for (let i = 0; i < s.length; i++) {
          const r = s.orientation === 'HORIZONTAL' ? s.startRow : s.startRow + i;
          const c = s.orientation === 'HORIZONTAL' ? s.startCol + i : s.startCol;
          if (r >= 0 && r < boardSize && c >= 0 && c < boardSize)
            grid[r][c] = s.sunk ? 'sunk' : 'ship';
        }
      }
    }

    if (opts.own && planned.length) {
      for (const s of planned) {
        const len = typeLength(s.type);
        for (let i = 0; i < len; i++) {
          const r = s.orientation === 'HORIZONTAL' ? s.startRow : s.startRow + i;
          const c = s.orientation === 'HORIZONTAL' ? s.startCol + i : s.startCol;
          if (r >= 0 && r < boardSize && c >= 0 && c < boardSize) grid[r][c] = 'ship';
        }
      }
    }
    if (shots) {
      for (const sh of shots) {
        const r = sh.row,
          c = sh.col;
        if (r >= 0 && r < boardSize && c >= 0 && c < boardSize) {
          if (sh.result === 'MISS') grid[r][c] = 'miss';
          else if (sh.result === 'HIT') grid[r][c] = 'hit';
          else if (sh.result === 'SUNK') grid[r][c] = 'hit';
        }
      }
    }
    return grid;
  }

  const myCells = buildCells(mySize, myData.ships.data, myData.shots.data, {
    own: true,
  });
  const oppShots = oppData.shots.data?.filter((s) => s.shooterUserId === myUserId);
  const oppCells = buildCells(oppSize, undefined, oppShots, { own: false });

  const seenShotIdsRef = useRef<Set<number>>(new Set());
  const [shotChip, setShotChip] = useState<{
    text: string;
    tone: 'success' | 'warning' | 'danger';
  } | null>(null);
  useEffect(() => {
    const shots = oppData.shots.data?.filter((s) => s.shooterUserId === myUserId);
    if (!shots) return;

    if (seenShotIdsRef.current.size === 0 && shots.length > 0) {
      shots.forEach((s) => seenShotIdsRef.current.add(s.id));
      return;
    }
    const newOnes = shots.filter((s) => !seenShotIdsRef.current.has(s.id));
    if (newOnes.length === 0) return;
    newOnes.forEach((s) => seenShotIdsRef.current.add(s.id));
    const latest = newOnes[newOnes.length - 1];
    const tone =
      latest.result === 'MISS' ? 'warning' : latest.result === 'HIT' ? 'success' : 'success';
    const text =
      latest.result === 'MISS'
        ? 'Miss'
        : latest.result === 'HIT'
          ? 'Hit!'
          : latest.sunkShipType
            ? `Sunk ${latest.sunkShipType}!`
            : 'Sunk!';
    setShotChip({ text, tone });
    const t = window.setTimeout(() => setShotChip(null), 1800);
    return () => window.clearTimeout(t);
  }, [oppData.shots.data, myUserId]);

  const canPlace = gameQ.data?.status === 'PLACING' && !!myBoard;
  const canShoot =
    gameQ.data?.status === 'IN_PROGRESS' && gameQ.data?.currentTurnUserId === myUserId;

  const onMyCellClick = (r: number, c: number) => {
    if (!canPlace) return;

    const idx = planned.findIndex((ship) => {
      const len = typeLength(ship.type);
      for (let i = 0; i < len; i++) {
        const rr = ship.orientation === 'HORIZONTAL' ? ship.startRow : ship.startRow + i;
        const cc = ship.orientation === 'HORIZONTAL' ? ship.startCol + i : ship.startCol;
        if (rr === r && cc === c) return true;
      }
      return false;
    });
    if (idx >= 0) {
      setPlanned((prev) => prev.filter((_, i) => i !== idx));
      return;
    }
    if (!selectedType) return;
    if (planned.some((p) => p.type === selectedType)) return;
    const p: Placement = {
      type: selectedType,
      startRow: r,
      startCol: c,
      orientation,
    };
    if (!isWithinBounds(mySize, p)) return;
    if (overlapsPlanned(p)) return;
    setPlanned((prev) => [...prev, p]);
  };

  const onOppCellClick = (r: number, c: number) => {
    if (canShoot) shootM.mutate({ row: r, col: c });
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!canPlace) return;
      if (e.key.toLowerCase() === 'r') {
        setOrientation((o) => (o === 'HORIZONTAL' ? 'VERTICAL' : 'HORIZONTAL'));
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [canPlace]);

  const waiting = !myBoard || !oppBoard;

  const myHighlight: Record<string, boolean> | undefined = useMemo(() => {
    if (!myData.ships.data || !myData.shots.data) return undefined;
    const anySunk = new Set<number>();
    for (const s of myData.ships.data) if (s.sunk) anySunk.add(s.id);
    if (!anySunk.size) return undefined;
    const map: Record<string, boolean> = {};
    for (const s of myData.ships.data) {
      if (!s.sunk) continue;
      for (let i = 0; i < s.length; i++) {
        const r = s.orientation === 'HORIZONTAL' ? s.startRow : s.startRow + i;
        const c = s.orientation === 'HORIZONTAL' ? s.startCol + i : s.startCol;
        map[`${r}:${c}`] = true;
      }
    }
    return map;
  }, [myData.ships.data, myData.shots.data]);

  const isFinished = gameQ.data?.status === 'FINISHED';
  const winnerId = gameQ.data?.winnerUserId ?? null;
  const myShotsCount = oppShots?.length ?? 0;
  const myHits = oppShots?.filter((s) => s.result === 'HIT' || s.result === 'SUNK').length ?? 0;
  const mySunk = oppShots?.filter((s) => s.result === 'SUNK').length ?? 0;
  const myHitRate = myShotsCount > 0 ? Math.round((myHits / myShotsCount) * 100) : 0;
  const myShipsLost = myData.ships.data?.filter((s) => s.sunk).length ?? 0;
  const shotsReceived = myData.shots.data?.length ?? 0;

  const isMyTurn = gameQ.data?.currentTurnUserId === myUserId;
  const statusBanner = (
    <div
      className={`rounded-lg border px-3 py-2 text-sm flex items-center gap-2 ${
        gameQ.data?.status === 'IN_PROGRESS'
          ? isMyTurn
            ? 'border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200'
            : 'border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-700 dark:bg-amber-900/30 dark:text-amber-200'
          : gameQ.data?.status === 'PLACING'
            ? 'border-sky-300 bg-sky-50 text-sky-800 dark:border-sky-700 dark:bg-sky-900/30 dark:text-sky-200'
            : 'border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200'
      }`}
    >
      <span className="font-medium">{gameQ.data?.status ?? ''}</span>
      {gameQ.data?.status === 'IN_PROGRESS' && (
        <span className={`ml-1 ${isMyTurn ? 'animate-pulse' : ''}`}>
          {isMyTurn ? 'Your turn' : 'Opponent turn'}
        </span>
      )}
      {gameQ.data?.status === 'PLACING' && <span className="ml-1">Place all 5 ships to start</span>}
    </div>
  );

  return (
    <div className="text-sm space-y-2 text-slate-800 dark:text-slate-100">
      <h2 className="text-2xl font-semibold">Game #{id}</h2>
      {gameQ.data && statusBanner}
      {!gameQ.data && !gameQ.isLoading && (
        <div className="p-3 rounded border bg-amber-50 text-amber-800 dark:bg-amber-900/30 dark:text-amber-100">
          Could not load game data. Ensure the game exists and you are logged in.
        </div>
      )}

      {waiting && <div className="p-3 border rounded text-sm">Waiting for opponent to join…</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <BoardGrid
            size={mySize}
            cells={myCells}
            title="Your Board"
            onCellClick={onMyCellClick}
            onCellEnter={(r, c) => setHoverCell({ r, c })}
            onCellLeave={() => setHoverCell(null)}
            preview={previewMap}
            highlight={myHighlight}
            loading={myData.ships.isLoading || myData.shots.isLoading}
          />
          {canPlace && (
            <ShipPlacementPanel
              existing={[
                ...(planned.map((p) => ({
                  id: -1,
                  boardId: myBoard?.id ?? -1,
                  type: p.type,
                  length: typeLength(p.type),
                  startRow: p.startRow,
                  startCol: p.startCol,
                  orientation: p.orientation,
                  sunk: false,
                })) as ShipView[]),
              ]}
              selectedType={selectedType}
              setSelectedType={setSelectedType}
              orientation={orientation}
              setOrientation={setOrientation}
            />
          )}
          {canPlace && (
            <div className="flex items-center gap-2">
              <button
                className="px-3 py-2 rounded border"
                onClick={() => setPlanned([])}
                disabled={!planned.length}
              >
                Reset planned
              </button>
              <button
                className="px-3 py-2 rounded bg-blue-600 text-white disabled:opacity-50"
                onClick={() => placeShipsM.mutate()}
                disabled={planned.length !== 5 || placeShipsM.isPending}
                title={planned.length !== 5 ? 'Place exactly 5 ships' : 'Submit placements'}
              >
                {placeShipsM.isPending ? 'Submitting…' : 'Confirm placements'}
              </button>
            </div>
          )}
        </div>
        <div className={`${!isMyTurn && gameQ.data?.status === 'IN_PROGRESS' ? 'opacity-70' : ''}`}>
          <div className="relative">
            <BoardGrid
              size={oppSize}
              cells={oppCells}
              title="Opponent Board"
              onCellClick={onOppCellClick}
              loading={oppData.shots.isLoading}
            />
            {(!myBoard || !oppBoard) && (
              <div className="mt-2 text-sm text-slate-700 dark:text-slate-200">
                {myBoard ? 'Waiting for opponent board…' : 'Waiting for your board…'}
              </div>
            )}
            {shotChip && (
              <div className="pointer-events-none absolute -top-2 -right-2">
                <div
                  className={`inline-flex items-center gap-2 px-4 py-2 text-base font-semibold rounded-xl border-2 shadow-lg ${
                    shotChip.tone === 'success'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      : shotChip.tone === 'danger'
                        ? 'bg-rose-50 text-rose-800 border-rose-300'
                        : 'bg-amber-50 text-amber-800 border-amber-300'
                  }`}
                >
                  {shotChip.text}
                </div>
              </div>
            )}
          </div>
          {!canShoot && gameQ.data?.status === 'IN_PROGRESS' && (
            <div className="mt-2 text-sm text-slate-700 dark:text-slate-200">
              Waiting for opponent turn…
            </div>
          )}
        </div>
      </div>
      {isFinished && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold">Game Over</h3>
            </div>
            <div className="text-sm space-y-2">
              <div>
                Winner:{' '}
                <span className="font-medium">{winnerId === myUserId ? 'You' : 'Opponent'}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div className="p-2 rounded border bg-slate-50 dark:bg-slate-800/40">
                  <div className="text-slate-600 dark:text-slate-400">Shots fired</div>
                  <div className="font-semibold">{myShotsCount}</div>
                </div>
                <div className="p-2 rounded border bg-slate-50 dark:bg-slate-800/40">
                  <div className="text-slate-600 dark:text-slate-400">Hit rate</div>
                  <div className="font-semibold">{myHitRate}%</div>
                </div>
                <div className="p-2 rounded border bg-slate-50 dark:bg-slate-800/40">
                  <div className="text-slate-600 dark:text-slate-400">Ships sunk</div>
                  <div className="font-semibold">{mySunk}</div>
                </div>
                <div className="p-2 rounded border bg-slate-50 dark:bg-slate-800/40">
                  <div className="text-slate-600 dark:text-slate-400">Ships lost</div>
                  <div className="font-semibold">{myShipsLost}</div>
                </div>
                <div className="p-2 rounded border bg-slate-50 dark:bg-slate-800/40 col-span-2">
                  <div className="text-slate-600 dark:text-slate-400">Shots received</div>
                  <div className="font-semibold">{shotsReceived}</div>
                </div>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                className="px-3 py-2 rounded border"
                onClick={() => window.location.assign('/lobby')}
              >
                Lobby
              </button>
              <button
                className="px-3 py-2 rounded bg-blue-600 text-white"
                onClick={() => window.location.assign('/')}
              >
                Play again
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
