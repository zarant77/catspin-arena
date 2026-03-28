import type { GameConfigOverrides } from '../config/GameConfig.js';
import { simulateSpins } from './simulateSpins.js';

type ParsedArgs = {
  readonly spins?: number;
  readonly seed?: number;
  readonly bet?: number;
  readonly profile?: string;
};

function parseArgs(argv: readonly string[]): ParsedArgs {
  const values = new Map<string, string>();

  argv.forEach((arg) => {
    if (arg.startsWith('--') === false) {
      return;
    }

    const [rawKey, rawValue] = arg.slice(2).split('=');
    if (rawKey.length === 0 || rawValue === undefined) {
      return;
    }

    values.set(rawKey, rawValue);
  });

  const spins = values.get('spins');
  const seed = values.get('seed');
  const bet = values.get('bet');
  const profile = values.get('profile');

  return {
    spins: spins === undefined ? undefined : Number(spins),
    seed: seed === undefined ? undefined : Number(seed),
    bet: bet === undefined ? undefined : Number(bet),
    profile,
  };
}

function formatPercent(value: number): string {
  return `${(value * 100).toFixed(4)}%`;
}

function main(): void {
  const args = parseArgs(process.argv.slice(2));

  const config: GameConfigOverrides | undefined =
    args.profile === undefined
      ? undefined
      : ({
          mathProfileId: args.profile,
        } as GameConfigOverrides);

  const summary = simulateSpins({
    spins: args.spins ?? 100_000,
    seed: args.seed ?? 123456789,
    betAmount: args.bet,
    config,
  });

  console.log('');
  console.log('CatSpin Arena simulation');
  console.log('------------------------');
  console.log(`Math profile: ${summary.mathProfileId}`);
  console.log(`Spins: ${summary.spins}`);
  console.log(`Seed: ${summary.seed}`);
  console.log(`Bet amount: ${summary.betAmount}`);
  console.log(`Total bet: ${summary.totalBet}`);
  console.log(`Total payout: ${summary.totalPayout}`);
  console.log(`RTP: ${formatPercent(summary.rtp)}`);
  console.log(`Hit rate: ${formatPercent(summary.hitRate)}`);
  console.log(`Winning spins: ${summary.winningSpins}`);
  console.log(`Average multiplier / spin: ${summary.averageMultiplierPerSpin.toFixed(6)}`);
  console.log(`Average multiplier / win: ${summary.averageMultiplierPerWin.toFixed(6)}`);
  console.log(`Max multiplier: ${summary.maxMultiplier}`);
  console.log('');
  console.log('Win distribution');
  console.log('----------------');

  if (summary.winDistribution.length === 0) {
    console.log('No wins');
  } else {
    summary.winDistribution.forEach((entry) => {
      console.log(`x${entry.multiplier}: ${entry.count}`);
    });
  }

  console.log('');
  console.log('Symbol counts');
  console.log('-------------');

  Object.entries(summary.symbolCounts).forEach(([symbol, count]) => {
    console.log(`${symbol}: ${count}`);
  });

  console.log('');
}

main();
