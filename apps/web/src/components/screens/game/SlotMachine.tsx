import { useEffect, useMemo, useRef, useState } from 'react';
import type { SymbolIdDTO, WinningLineDTO } from '@catspin/protocol';
import { SLOT_SYMBOL_IDS, SLOT_SYMBOL_VIEW } from './slotSymbols';

type SlotMachineProps = {
  readonly grid: readonly (readonly SymbolIdDTO[])[];
  readonly isSpinning: boolean;
  readonly winningLines: readonly WinningLineDTO[];
};

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

function getWinningCellSet(winningLines: readonly WinningLineDTO[]): ReadonlySet<string> {
  const cells = new Set<string>();

  winningLines.forEach((line) => {
    const rowIndex = line.lineIndex;

    for (let colIndex = 0; colIndex < line.count; colIndex += 1) {
      cells.add(`${rowIndex}:${colIndex}`);
    }
  });

  return cells;
}

export function SlotMachine(props: SlotMachineProps) {
  const { grid, isSpinning, winningLines } = props;

  const normalizedGrid = useMemo<SymbolIdDTO[][] | null>(() => {
    return normalizeGrid(grid);
  }, [grid]);

  const lastValidGridRef = useRef<SymbolIdDTO[][]>(createRandomGrid(3, 5));

  if (normalizedGrid !== null) {
    lastValidGridRef.current = normalizedGrid;
  }

  const [displayGrid, setDisplayGrid] = useState<SymbolIdDTO[][]>(lastValidGridRef.current);
  const [displayWinningLines, setDisplayWinningLines] = useState<WinningLineDTO[]>([]);
  const prevIsSpinningRef = useRef(isSpinning);

  useEffect(() => {
    const wasSpinning = prevIsSpinningRef.current;
    const spinJustStarted = wasSpinning === false && isSpinning === true;
    const spinJustFinished = wasSpinning === true && isSpinning === false;

    if (spinJustStarted) {
      setDisplayWinningLines([]);
    }

    if (spinJustFinished) {
      if (normalizedGrid !== null) {
        setDisplayGrid(normalizedGrid);
      }

      setDisplayWinningLines([...winningLines]);
    }

    if (wasSpinning === false && isSpinning === false && normalizedGrid !== null) {
      setDisplayGrid(normalizedGrid);
    }

    prevIsSpinningRef.current = isSpinning;
  }, [isSpinning, normalizedGrid, winningLines]);

  useEffect(() => {
    if (!isSpinning) {
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
  }, [isSpinning, normalizedGrid]);

  const winningCells = useMemo(() => {
    return getWinningCellSet(displayWinningLines);
  }, [displayWinningLines]);

  const hasRenderableGrid = displayGrid.length > 0;

  return (
    <div className="slot-machine stack">
      {!hasRenderableGrid ? (
        <div className="slot-empty card muted">No grid</div>
      ) : (
        displayGrid.map((row, rowIndex) => (
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
        ))
      )}
    </div>
  );
}
