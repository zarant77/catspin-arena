import { useEffect, useMemo, useRef, useState } from 'react';
import type { WinningLineDTO, PaylinePresentationConfigDTO } from '@catspin/protocol';

type SlotPaylinesOverlayMode = 'hidden' | 'all' | 'winning';

type SlotPaylinesOverlayProps = {
  readonly paylines: readonly (readonly number[])[];
  readonly rows: number;
  readonly cols: number;
  readonly winningLines: readonly WinningLineDTO[];
  readonly mode: SlotPaylinesOverlayMode;
  readonly animationKey: number;
  readonly presentation: PaylinePresentationConfigDTO;
  readonly onSequenceComplete?: () => void;
};

type Point = {
  readonly x: number;
  readonly y: number;
};

type AnimatedLine = {
  readonly id: string;
  readonly lineIndex: number;
  readonly isWinning: boolean;
  readonly points: readonly Point[];
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function buildPolylinePoints(
  payline: readonly number[],
  rows: number,
  cols: number,
  visibleCount?: number,
): readonly Point[] {
  if (rows <= 0 || cols <= 0) {
    return [];
  }

  const limitedCols = visibleCount === undefined ? cols : clamp(visibleCount, 0, cols);

  if (limitedCols <= 0) {
    return [];
  }

  const cellWidth = 100 / cols;
  const cellHeight = 100 / rows;

  return Array.from({ length: limitedCols }, (_, colIndex) => {
    const rawRowIndex = payline[colIndex] ?? 0;
    const rowIndex = clamp(rawRowIndex, 0, rows - 1);

    return {
      x: colIndex * cellWidth + cellWidth / 2,
      y: rowIndex * cellHeight + cellHeight / 2,
    };
  });
}

function toPointsAttribute(points: readonly Point[]): string {
  return points.map((point) => `${point.x},${point.y}`).join(' ');
}

function getPathLength(points: readonly Point[]): number {
  let length = 0;

  for (let index = 1; index < points.length; index += 1) {
    const prev = points[index - 1];
    const next = points[index];

    if (prev === undefined || next === undefined) {
      continue;
    }

    const dx = next.x - prev.x;
    const dy = next.y - prev.y;

    length += Math.hypot(dx, dy);
  }

  return length;
}

function getPointAtProgress(points: readonly Point[], progress: number): Point {
  if (points.length === 0) {
    return { x: 0, y: 0 };
  }

  if (points.length === 1) {
    return points[0] ?? { x: 0, y: 0 };
  }

  const safeProgress = clamp(progress, 0, 1);
  const totalLength = getPathLength(points);

  if (totalLength <= 0) {
    return points[0] ?? { x: 0, y: 0 };
  }

  let remainingDistance = totalLength * safeProgress;

  for (let index = 1; index < points.length; index += 1) {
    const start = points[index - 1];
    const end = points[index];

    if (start === undefined || end === undefined) {
      continue;
    }

    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const segmentLength = Math.hypot(dx, dy);

    if (segmentLength <= 0) {
      continue;
    }

    if (remainingDistance <= segmentLength) {
      const ratio = remainingDistance / segmentLength;

      return {
        x: start.x + dx * ratio,
        y: start.y + dy * ratio,
      };
    }

    remainingDistance -= segmentLength;
  }

  return points[points.length - 1] ?? { x: 0, y: 0 };
}

function buildAnimatedLines(
  mode: SlotPaylinesOverlayMode,
  paylines: readonly (readonly number[])[],
  winningLines: readonly WinningLineDTO[],
  rows: number,
  cols: number,
): readonly AnimatedLine[] {
  if (mode === 'hidden') {
    return [];
  }

  if (mode === 'all') {
    return paylines
      .map<AnimatedLine | null>((payline, lineIndex) => {
        const points = buildPolylinePoints(payline, rows, cols);

        if (points.length < 2) {
          return null;
        }

        return {
          id: `all-${lineIndex}`,
          lineIndex,
          isWinning: false,
          points,
        };
      })
      .filter((line): line is AnimatedLine => line !== null);
  }

  return winningLines
    .map<AnimatedLine | null>((line, sequenceIndex) => {
      const payline = paylines[line.lineIndex];

      if (payline === undefined) {
        return null;
      }

      const points = buildPolylinePoints(payline, rows, cols, line.count);

      if (points.length < 2) {
        return null;
      }

      return {
        id: `win-${line.lineIndex}-${sequenceIndex}-${line.count}`,
        lineIndex: line.lineIndex,
        isWinning: true,
        points,
      };
    })
    .filter((line): line is AnimatedLine => line !== null);
}

export function SlotPaylinesOverlay(props: SlotPaylinesOverlayProps) {
  const { paylines, rows, cols, winningLines, mode, animationKey, presentation, onSequenceComplete } = props;

  const lineDurationMs = presentation.lineDurationMs;
  const lineGapMs = presentation.lineGapMs;
  const hideDelayMs = presentation.hideDelayMs;

  const onSequenceCompleteRef = useRef<(() => void) | undefined>(onSequenceComplete);

  useEffect(() => {
    onSequenceCompleteRef.current = onSequenceComplete;
  }, [onSequenceComplete]);

  const animatedLines = useMemo(() => {
    return buildAnimatedLines(mode, paylines, winningLines, rows, cols);
  }, [mode, paylines, winningLines, rows, cols]);

  const [activeLineIndex, setActiveLineIndex] = useState<number>(-1);
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (mode === 'hidden' || animatedLines.length === 0) {
      setActiveLineIndex(-1);
      setProgress(0);
      setIsVisible(false);
      return;
    }

    setIsVisible(true);
    setActiveLineIndex(0);
    setProgress(0);

    let frameId = 0;
    let timeoutId = 0;
    let sequenceCancelled = false;
    let lineStartTime = 0;

    const runLine = (lineIndex: number): void => {
      setActiveLineIndex(lineIndex);
      setProgress(0);
      lineStartTime = performance.now();

      const tick = (now: number): void => {
        if (sequenceCancelled) {
          return;
        }

        const elapsed = now - lineStartTime;
        const nextProgress = clamp(elapsed / lineDurationMs, 0, 1);

        setProgress(nextProgress);

        if (nextProgress < 1) {
          frameId = window.requestAnimationFrame(tick);
          return;
        }

        const isLastLine = lineIndex >= animatedLines.length - 1;

        if (isLastLine) {
          timeoutId = window.setTimeout(() => {
            if (sequenceCancelled) {
              return;
            }

            setIsVisible(false);
            setActiveLineIndex(-1);
            setProgress(0);
            onSequenceCompleteRef.current?.();
          }, hideDelayMs);

          return;
        }

        timeoutId = window.setTimeout(() => {
          if (sequenceCancelled) {
            return;
          }

          runLine(lineIndex + 1);
        }, lineGapMs);
      };

      frameId = window.requestAnimationFrame(tick);
    };

    runLine(0);

    return () => {
      sequenceCancelled = true;
      window.cancelAnimationFrame(frameId);
      window.clearTimeout(timeoutId);
    };
  }, [mode, animationKey, animatedLines, lineDurationMs, lineGapMs, hideDelayMs]);

  if (!isVisible || animatedLines.length === 0) {
    return null;
  }

  const activeLine = animatedLines[activeLineIndex];

  if (activeLine === undefined) {
    return null;
  }

  const circlePoint = getPointAtProgress(activeLine.points, progress);

  return (
    <div
      className="slot-paylines-overlay"
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 3,
      }}
    >
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={{
          width: '100%',
          height: '100%',
          overflow: 'visible',
        }}
      >
        <polyline
          points={toPointsAttribute(activeLine.points)}
          fill="none"
          stroke={activeLine.isWinning ? 'rgba(255, 215, 0, 0.95)' : 'rgba(255, 255, 255, 0.45)'}
          strokeWidth={1.1}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <circle
          cx={circlePoint.x}
          cy={circlePoint.y}
          r={2.2}
          fill={activeLine.isWinning ? 'rgba(255, 215, 0, 1)' : 'rgba(255, 255, 255, 0.95)'}
        />
      </svg>
    </div>
  );
}
