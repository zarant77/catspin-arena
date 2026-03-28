import Phaser from 'phaser';
import { type SlotSymbolId } from '@catspin/assets';
import { getView, spin, tick } from './core';
import { SlotHud } from './slot/SlotHud';
import { SlotMachine } from './slot/SlotMachine';

export class GameScene extends Phaser.Scene {
  private slotMachine!: SlotMachine;
  private slotHud!: SlotHud;

  private lastRoundStatus = '';
  private lastResolvedKey = '';

  public constructor() {
    super('GameScene');
  }

  public preload(): void {
    this.slotMachine = new SlotMachine(this);
    this.slotMachine.preload();
  }

  public create(): void {
    this.cameras.main.setBackgroundColor('#0b0615');
    this.add.rectangle(640, 360, 1280, 720, 0x12081f);

    this.add
      .text(640, 60, 'CATSPIN SLOT', {
        fontFamily: 'Arial',
        fontSize: '42px',
        color: '#ffd166',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    this.slotMachine.create();

    this.slotHud = new SlotHud(this, () => {
      const view = getView();

      if (view.round.status !== 'betting') {
        return;
      }

      spin(1);
    });

    this.slotHud.create();
    this.renderStaticState();
  }

  public update(_time: number, delta: number): void {
    tick();

    const view = getView();
    const roundStatus = view.round.status;

    if (roundStatus !== this.lastRoundStatus) {
      this.handleRoundStatusChanged(this.lastRoundStatus, roundStatus);
      this.lastRoundStatus = roundStatus;
    }

    this.slotMachine.update(delta);

    if (roundStatus === 'resolved' && view.round.result !== null) {
      const key = JSON.stringify(view.round.result.grid);

      if (key !== this.lastResolvedKey) {
        this.lastResolvedKey = key;
        this.slotMachine.applyResolvedGrid(view.round.result.grid as readonly (readonly SlotSymbolId[])[]);
        this.playResolvedEffects();
      }
    }

    this.renderStaticState();
  }

  private handleRoundStatusChanged(prevStatus: string, nextStatus: string): void {
    if (prevStatus !== 'spinning' && nextStatus === 'spinning') {
      this.slotMachine.startSpin();
      return;
    }

    if (prevStatus === 'spinning' && nextStatus === 'resolved') {
      this.slotMachine.scheduleStop();
      return;
    }

    if (nextStatus === 'betting') {
      this.slotHud.clearWinText();
      this.lastResolvedKey = '';
    }
  }

  private playResolvedEffects(): void {
    const view = getView();
    const result = view.round.result;

    if (result === null) {
      return;
    }

    if (result.totalMultiplier > 0) {
      this.slotHud.playWinPulse();

      for (const line of result.winningLines) {
        const payline = view.config.paylines[line.lineIndex];

        if (payline !== undefined) {
          this.slotMachine.highlightWinningLine(payline);
        }
      }
    }
  }

  private renderStaticState(): void {
    const view = getView();
    const player = view.players[0];
    const result = view.round.result;

    const winText = result === null ? '' : result.totalMultiplier > 0 ? `WIN x${result.totalMultiplier}` : 'NO WIN';

    this.slotHud.render({
      roundStatus: view.round.status,
      balance: player?.balance ?? 0,
      winText: view.round.status === 'betting' ? '' : winText,
      canSpin: view.round.status === 'betting',
    });
  }
}
