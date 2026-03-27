export type SlotSymbolId = 'L1' | 'L2' | 'L3' | 'L4' | 'M1' | 'M2' | 'H1' | 'H2';

export const SLOT_SYMBOL_VIEW: Readonly<Record<SlotSymbolId, string>> = {
  L1: '/assets/img/slots/L1.png',
  L2: '/assets/img/slots/L2.png',
  L3: '/assets/img/slots/L3.png',
  L4: '/assets/img/slots/L4.png',
  M1: '/assets/img/slots/M1.png',
  M2: '/assets/img/slots/M2.png',
  H1: '/assets/img/slots/H1.png',
  H2: '/assets/img/slots/H2.png',
};

export const SLOT_SYMBOL_IDS: readonly SlotSymbolId[] = ['L1', 'L2', 'L3', 'L4', 'M1', 'M2', 'H1', 'H2'];
