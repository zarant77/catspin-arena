import type { MathProfileId, MathProfileOption, SlotMathConfig } from './MathConfig';
import { CLASSIC_HIGH_MATH, CLASSIC_LOW_MATH, CLASSIC_MEDIUM_MATH, HIGH_RTP_TEST } from './MathPresets';

const REGISTRY: Readonly<Record<MathProfileId, SlotMathConfig>> = {
  'classic-low': CLASSIC_LOW_MATH,
  'classic-medium': CLASSIC_MEDIUM_MATH,
  'classic-high': CLASSIC_HIGH_MATH,
  'high-rtp-test': HIGH_RTP_TEST,
};

export function getMathConfig(profileId: MathProfileId): SlotMathConfig {
  return REGISTRY[profileId];
}

export function getAllMathConfigs(): readonly SlotMathConfig[] {
  return Object.values(REGISTRY);
}

export function getMathProfileOptions(): readonly MathProfileOption[] {
  return Object.values(REGISTRY).map((config) => ({
    id: config.id,
    label: config.label,
    stats: config.stats,
  }));
}
