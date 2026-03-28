import L1 from '../slots/L1.png';
import L2 from '../slots/L2.png';
import L3 from '../slots/L3.png';
import L4 from '../slots/L4.png';
import M1 from '../slots/M1.png';
import M2 from '../slots/M2.png';
import H1 from '../slots/H1.png';
import H2 from '../slots/H2.png';

export type SlotSymbolId = 'L1' | 'L2' | 'L3' | 'L4' | 'M1' | 'M2' | 'H1' | 'H2';

export const SLOT_SYMBOL_VIEW: Readonly<Record<SlotSymbolId, string>> = {
  L1,
  L2,
  L3,
  L4,
  M1,
  M2,
  H1,
  H2,
};

export const SLOT_SYMBOL_IDS: readonly SlotSymbolId[] = ['L1', 'L2', 'L3', 'L4', 'M1', 'M2', 'H1', 'H2'];
