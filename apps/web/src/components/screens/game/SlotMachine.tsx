import { useEffect, useMemo, useRef, useState } from 'react';
import type { SymbolIdDTO, WinningLineDTO, RoundStatusDTO, PaylinePresentationConfigDTO } from '@catspin/protocol';
import { SLOT_SYMBOL_IDS, SLOT_SYMBOL_VIEW } from './slotSymbols';
import { SlotPaylinesOverlay } from './SlotPaylinesOverlay';

type SlotMachineProps = {
  readonly grid: readonly (readonly SymbolIdDTO[])[];
  readonly paylines: readonly (readonly number[])[];
  readonly roundStatus: RoundStatusDTO;
  readonly roundIndex: number;
  readonly paylinePresentation: PaylinePresentationConfigDTO;
  readonly winningLines: readonly WinningLineDTO[];
};

type PaylinesOverlayMode = 'hidden' | 'all' | 'winning';

function createRandomGrid(rows: number, cols: number): SymbolIdDTO[][] {
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => {
      const index = Math.floor(Math.random() * SLOT_SYMBOL_IDS.length);
      return SLOT_SYMBOL_IDS[index];
    }),
  );
}

function transposeGrid(grid: readonly (readonly SymbolIdDTO[])[]): SymbolIdDTO[][] {
  const cols = grid.length;
  const rows = grid[0]?.length ?? 0;

  return Array.from({ length: rows }, (_, rowIndex) =>
    Array.from({ length: cols }, (_, colIndex) => grid[colIndex]?.[rowIndex]),
  );
}

function isRectangularGrid(grid: readonly (readonly SymbolIdDTO[])[]): boolean {
  if (grid.length === 0) {
    return false;
  }

  const innerLength = grid[0]?.length ?? 0;

  if (innerLength === 0) {
    return false;
  }

  return grid.every((row) => row.length === innerLength);
}

function normalizeGrid(grid: readonly (readonly SymbolIdDTO[])[]): SymbolIdDTO[][] | null {
  if (!isRectangularGrid(grid)) {
    return null;
  }

  const outer = grid.length;
  const inner = grid[0]?.length ?? 0;

  if (outer === 3 && inner === 5) {
    return grid.map((row) => [...row]);
  }

  if (outer === 5 && inner === 3) {
    return transposeGrid(grid);
  }

  return null;
}

function getWinningCellSet(
  paylines: readonly (readonly number[])[],
  winningLines: readonly WinningLineDTO[],
  rows: number,
  cols: number,
): ReadonlySet<string> {
  const cells = new Set<string>();

  winningLines.forEach((line) => {
    const payline = paylines[line.lineIndex];

    if (payline === undefined) {
      return;
    }

    const visibleCount = Math.min(line.count, cols);

    for (let colIndex = 0; colIndex < visibleCount; colIndex += 1) {
      const rowIndex = payline[colIndex];

      if (rowIndex === undefined) {
        continue;
      }

      if (rowIndex < 0 || rowIndex >= rows) {
        continue;
      }

      cells.add(`${rowIndex}:${colIndex}`);
    }
  });

  return cells;
}

export function SlotMachine(props: SlotMachineProps) {
  const { grid, paylines, roundStatus, roundIndex, paylinePresentation, winningLines } = props;

  const normalizedGrid = useMemo<SymbolIdDTO[][] | null>(() => {
    return normalizeGrid(grid);
  }, [grid]);

  const lastValidGridRef = useRef<SymbolIdDTO[][]>(createRandomGrid(3, 5));

  if (normalizedGrid !== null) {
    lastValidGridRef.current = normalizedGrid;
  }

  const [displayGrid, setDisplayGrid] = useState<SymbolIdDTO[][]>(lastValidGridRef.current);
  const [displayWinningLines, setDisplayWinningLines] = useState<WinningLineDTO[]>([]);
  const [overlayMode, setOverlayMode] = useState<PaylinesOverlayMode>('hidden');
  const [overlayAnimationKey, setOverlayAnimationKey] = useState(0);

  const prevStatusRef = useRef<RoundStatusDTO | null>(null);
  const hasShownIntroRef = useRef(false);

  useEffect(() => {
    const previousStatus = prevStatusRef.current;

    const isIntroRound = roundIndex === 1;
    const firstRenderInPresenting = previousStatus === null && roundStatus === 'presenting';
    const enteredPresenting = previousStatus !== 'presenting' && roundStatus === 'presenting';
    const leftPresenting = previousStatus === 'presenting' && roundStatus !== 'presenting';
    const enteredSpinning = previousStatus !== 'spinning' && roundStatus === 'spinning';
    const enteredResolved = previousStatus !== 'resolved' && roundStatus === 'resolved';
    const leftResolved = previousStatus === 'resolved' && roundStatus !== 'resolved';

    if ((firstRenderInPresenting || enteredPresenting) && isIntroRound && hasShownIntroRef.current === false) {
      hasShownIntroRef.current = true;
      setDisplayWinningLines([]);
      setOverlayMode('all');
      setOverlayAnimationKey((value) => value + 1);
    }

    if (leftPresenting) {
      setOverlayMode('hidden');
      setDisplayWinningLines([]);
    }

    if (enteredSpinning) {
      setOverlayMode('hidden');
      setDisplayWinningLines([]);
    }

    if (enteredResolved) {
      if (normalizedGrid !== null) {
        setDisplayGrid(normalizedGrid);
      }

      const nextWinningLines = [...winningLines];
      setDisplayWinningLines(nextWinningLines);

      if (nextWinningLines.length > 0) {
        setOverlayMode('winning');
        setOverlayAnimationKey((value) => value + 1);
      } else {
        setOverlayMode('hidden');
      }
    }

    if (leftResolved) {
      setOverlayMode('hidden');
    }

    if (roundStatus !== 'spinning' && normalizedGrid !== null) {
      setDisplayGrid(normalizedGrid);
    }

    prevStatusRef.current = roundStatus;
  }, [roundStatus, roundIndex, normalizedGrid, winningLines]);

  useEffect(() => {
    if (roundStatus !== 'spinning') {
      return;
    }

    const baseGrid = normalizedGrid ?? lastValidGridRef.current;
    const rows = baseGrid.length || 3;
    const cols = baseGrid[0]?.length ?? 5;

    const intervalId = window.setInterval(() => {
      setDisplayGrid(createRandomGrid(rows, cols));
    }, 100);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [roundStatus, normalizedGrid]);

  const rows = displayGrid.length;
  const cols = displayGrid[0]?.length ?? 0;

  const winningCells = useMemo(() => {
    return getWinningCellSet(paylines, displayWinningLines, rows, cols);
  }, [paylines, displayWinningLines, rows, cols]);

  const hasRenderableGrid = displayGrid.length > 0;

  return (
    <div className="slot-machine stack">
      {!hasRenderableGrid ? (
        <div className="slot-empty card muted">No grid</div>
      ) : (
        <div
          className="slot-machine-board"
          style={{
            position: 'relative',
          }}
        >
          <div
            className="slot-machine-grid"
            style={{
              position: 'relative',
              zIndex: 1,
            }}
          >
            {displayGrid.map((row, rowIndex) => (
              <div
                key={`row-${rowIndex}`}
                className="slot-row"
                style={{
                  gridTemplateColumns: `repeat(${row.length}, minmax(0, 1fr))`,
                }}
              >
                {row.map((symbol, colIndex) => {
                  const isWinningCell = winningCells.has(`${rowIndex}:${colIndex}`);

                  return (
                    <div key={`${rowIndex}-${colIndex}`} className="slot-cell" data-win={isWinningCell}>
                      {SLOT_SYMBOL_VIEW[symbol]}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          <SlotPaylinesOverlay
            paylines={paylines}
            rows={rows}
            cols={cols}
            winningLines={displayWinningLines}
            mode={overlayMode}
            animationKey={overlayAnimationKey}
            presentation={paylinePresentation}
            onSequenceComplete={() => {
              if (prevStatusRef.current === 'resolved') {
                setOverlayMode('hidden');
              }
            }}
          />
        </div>
      )}
    </div>
  );
}
