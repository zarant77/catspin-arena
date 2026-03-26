import { useRef } from 'react';

type BetControlsProps = {
  readonly value: number;
  readonly min: number;
  readonly max: number;
  readonly step: number;
  readonly disabled: boolean;
  readonly onChange: (value: number) => void;
  readonly onSubmit: () => void;
};

function clamp(value: number, min: number, max: number): number {
  if (Number.isFinite(value) === false) {
    return min;
  }

  return Math.min(Math.max(value, min), max);
}

export function BetControls(props: BetControlsProps) {
  const { value, min, max, step, disabled, onChange, onSubmit } = props;

  const stackRef = useRef<HTMLDivElement | null>(null);

  const stepsCount = Math.floor((max - min) / step) + 1;

  const getValueFromPointer = (clientX: number, clientY: number): number => {
    const element = stackRef.current;

    if (element === null) {
      return value;
    }

    const rect = element.getBoundingClientRect();
    const isHorizontal = rect.width > rect.height;

    if (isHorizontal) {
      const offsetX = clamp(clientX - rect.left, 0, rect.width);
      const ratio = rect.width === 0 ? 0 : offsetX / rect.width;
      const rawIndex = Math.round(ratio * (stepsCount - 1));
      const index = clamp(rawIndex, 0, stepsCount - 1);

      return min + index * step;
    }

    const offsetY = clamp(clientY - rect.top, 0, rect.height);
    const ratioFromBottom = rect.height === 0 ? 0 : 1 - offsetY / rect.height;
    const rawIndex = Math.round(ratioFromBottom * (stepsCount - 1));
    const index = clamp(rawIndex, 0, stepsCount - 1);

    return min + index * step;
  };

  const updateFromPointer = (clientX: number, clientY: number): void => {
    if (disabled) {
      return;
    }

    onChange(getValueFromPointer(clientX, clientY));
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>): void => {
    if (disabled) {
      return;
    }

    event.currentTarget.setPointerCapture(event.pointerId);
    updateFromPointer(event.clientX, event.clientY);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>): void => {
    if (disabled || event.buttons === 0) {
      return;
    }

    updateFromPointer(event.clientX, event.clientY);
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>): void => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    if (!disabled) {
      onSubmit();
    }
  };

  const steps = Array.from({ length: stepsCount }, (_, index) => {
    const itemValue = min + index * step;
    const active = itemValue <= value;

    return <div key={itemValue} className={active ? 'bet-step is-active' : 'bet-step'} />;
  });

  return (
    <div className="bet-controls">
      <div
        ref={stackRef}
        className="bet-stack"
        role="slider"
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-disabled={disabled}
        data-disabled={disabled}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        {steps}
        <div className="bet-value">{value}</div>
      </div>
    </div>
  );
}
