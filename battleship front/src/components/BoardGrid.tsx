import { Fragment } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
export type CellState = 'empty' | 'ship' | 'hit' | 'miss' | 'sunk';

type PreviewState = 'valid' | 'invalid';

export default function BoardGrid({
  size,
  cells,
  onCellClick,
  title,
  onCellEnter,
  onCellLeave,
  preview,
  loading,
  minCellPx = 34,
  highlight,
}: {
  size: number;
  cells: CellState[][];
  onCellClick?: (row: number, col: number) => void;
  title?: string;
  onCellEnter?: (row: number, col: number) => void;
  onCellLeave?: (row: number, col: number) => void;
  preview?: Record<string, PreviewState>;
  loading?: boolean;
  minCellPx?: number;
  highlight?: Record<string, boolean>;
}) {
  const prefersReduced = useReducedMotion();
  const colLabels = Array.from({ length: size }, (_, i) =>
    String.fromCharCode('A'.charCodeAt(0) + i)
  );
  const rowLabels = Array.from({ length: size }, (_, i) => `${i + 1}`);

  return (
    <div>
      {title && <div className="mb-2 font-medium">{title}</div>}
      <motion.div
        initial={prefersReduced ? false : { opacity: 0, y: 8 }}
        animate={prefersReduced ? {} : { opacity: 1, y: 0 }}
        transition={prefersReduced ? undefined : { duration: 0.2, ease: 'easeOut' }}
        className="grid w-full bg-slate-200 dark:bg-slate-900 p-[2px] gap-[2px] rounded-lg shadow-sm"
        style={{
          gridTemplateColumns: `${minCellPx}px repeat(${size}, minmax(${minCellPx}px, 1fr))`,
          gridTemplateRows: `${minCellPx}px repeat(${size}, minmax(${minCellPx}px, 1fr))`,
        }}
      >
        <div />
        {colLabels.map((lbl) => (
          <div
            key={`col-${lbl}`}
            aria-hidden="true"
            className="text-xs flex items-center justify-center text-slate-900 dark:text-slate-50"
            style={{ height: minCellPx }}
          >
            {lbl}
          </div>
        ))}

        {rowLabels.map((rLbl, r) => (
          <Fragment key={`row-${r}`}>
            <div
              key={`rowlbl-${rLbl}`}
              aria-hidden="true"
              className="text-xs flex items-center justify-center text-slate-900 dark:text-slate-50"
              style={{ width: minCellPx }}
            >
              {rLbl}
            </div>
            {cells[r].map((cell, c) => {
              const key = `${r}:${c}`;
              const pState = preview?.[key];
              const isEmpty = cell === 'empty';
              const showPreview = isEmpty && pState;
              const labelState =
                cell === 'ship'
                  ? 'ship'
                  : cell === 'hit'
                    ? 'hit'
                    : cell === 'miss'
                      ? 'miss'
                      : cell === 'sunk'
                        ? 'sunk'
                        : showPreview === 'valid'
                          ? 'valid placement'
                          : showPreview === 'invalid'
                            ? 'invalid placement'
                            : 'empty';
              const ariaLabel = `${colLabels[c]}${r + 1} ${labelState}`;

              let bg = 'bg-white dark:bg-slate-800';
              if (cell === 'ship') bg = 'bg-slate-500';
              if (cell === 'hit') bg = 'bg-red-600';
              if (cell === 'miss') bg = 'bg-blue-100 dark:bg-blue-900';
              if (cell === 'sunk') bg = 'bg-gray-900';
              if (showPreview === 'valid') bg = 'bg-emerald-200 dark:bg-emerald-800';
              if (showPreview === 'invalid') bg = 'bg-rose-200 dark:bg-rose-900';

              if (loading) {
                return (
                  <div
                    key={`sk-${key}`}
                    className="aspect-square rounded-sm bg-slate-200 dark:bg-slate-700 animate-pulse"
                  />
                );
              }

              return (
                <motion.button
                  key={key}
                  className={[
                    'relative aspect-square text-xs flex items-center justify-center select-none transition-colors duration-150 rounded-sm',
                    bg,
                    'border focus:outline-none focus:ring-2 focus:ring-blue-400',
                    cell === 'hit'
                      ? 'text-white border-red-700 hit-anim'
                      : 'border-slate-300 dark:border-slate-500',
                    highlight?.[key] ? 'outline outline-2 outline-amber-400 animate-pulse' : '',
                  ].join(' ')}
                  onClick={() => onCellClick?.(r, c)}
                  onMouseEnter={() => onCellEnter?.(r, c)}
                  onMouseLeave={() => onCellLeave?.(r, c)}
                  aria-label={ariaLabel}
                  whileTap={prefersReduced ? undefined : { scale: 0.96 }}
                  whileHover={prefersReduced ? undefined : { scale: !loading ? 1.02 : 1 }}
                  animate={prefersReduced ? undefined : { scale: cell === 'hit' ? 1.04 : 1 }}
                  transition={
                    prefersReduced
                      ? undefined
                      : {
                          type: 'spring',
                          stiffness: 300,
                          damping: 22,
                          mass: 0.4,
                        }
                  }
                >
                  {cell === 'miss' && (
                    <span className="relative inline-flex items-center justify-center">
                      <motion.span
                        className="w-2 h-2 rounded-full bg-blue-600"
                        initial={prefersReduced ? false : { scale: 0.8, opacity: 0.7 }}
                        animate={prefersReduced ? {} : { scale: 1, opacity: 1 }}
                      />
                      <span className="absolute inline-block w-2 h-2 rounded-full bg-blue-600/50 ripple-anim" />
                    </span>
                  )}
                </motion.button>
              );
            })}
          </Fragment>
        ))}
      </motion.div>
    </div>
  );
}
