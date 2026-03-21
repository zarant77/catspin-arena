import { useMemo } from "react";
import type { PlayerView } from "../../types/playerView";

type BetControlsOrientation = "horizontal" | "vertical";

type BetControlsProps = {
  readonly value: number;
  readonly disabled: boolean;
  readonly currentPlayer: PlayerView | null;
  readonly onChange: (value: number) => void;
  readonly onSubmit: () => void;
  readonly orientation?: BetControlsOrientation;
};

const MIN_BET = 10;
const DEFAULT_MAX_BET = 100;
const COIN_STEPS = 10;

function clamp(value: number, min: number, max: number): number {
  if (Number.isFinite(value) === false) {
    return min;
  }

  return Math.min(Math.max(value, min), max);
}

export function BetControls(props: BetControlsProps) {
  const {
    value,
    disabled,
    currentPlayer,
    onChange,
    onSubmit,
    orientation = "horizontal",
  } = props;

  const maxBet = Math.max(MIN_BET, currentPlayer?.balance ?? DEFAULT_MAX_BET);

  const safeValue = clamp(value, MIN_BET, maxBet);

  const canSubmit =
    currentPlayer !== null &&
    disabled === false &&
    Number.isFinite(safeValue) &&
    safeValue >= MIN_BET;

  const fillRatio =
    maxBet <= MIN_BET ? 1 : (safeValue - MIN_BET) / (maxBet - MIN_BET);

  const activeCoins = useMemo(() => {
    return Math.max(1, Math.round(fillRatio * (COIN_STEPS - 1)) + 1);
  }, [fillRatio]);

  const coins = useMemo(() => {
    return Array.from({ length: COIN_STEPS }, (_, index) => {
      const isActive = index < activeCoins;

      return (
        <span
          key={index}
          className={isActive ? "coin active" : "coin"}
          aria-hidden="true"
        >
          🪙
        </span>
      );
    });
  }, [activeCoins]);

  return (
    <div className={`bet-control ${orientation}`}>
      <div className="bet-header">
        <span className="bet-title">Your Bet</span>

        <div className="bet-stats">
          <span className="bet-value">{safeValue}</span>
          <span className="bet-balance">
            Balance: {currentPlayer?.balance ?? "—"}
          </span>
        </div>
      </div>

      <div className="bet-slider-wrap">
        <div className="bet-coins" aria-hidden="true">
          {coins}
        </div>

        <input
          className="bet-range"
          type="range"
          min={MIN_BET}
          max={maxBet}
          step={1}
          value={safeValue}
          onChange={(event) =>
            onChange(clamp(Number(event.target.value), MIN_BET, maxBet))
          }
          disabled={disabled}
          aria-label="Bet amount"
        />
      </div>

      <button
        type="button"
        className="bet-submit"
        onClick={onSubmit}
        disabled={!canSubmit}
      >
        Set Bet
      </button>
    </div>
  );
}
