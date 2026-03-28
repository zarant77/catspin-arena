import Phaser from 'phaser';
import { spin, tick, getView } from './core';

export class GameScene extends Phaser.Scene {
  private symbols: Phaser.GameObjects.Text[][] = [];
  private spinButton!: Phaser.GameObjects.Text;
  private lastGridKey = '';

  public constructor() {
    super('Game');
  }

  public create(): void {
    // Create grid (5x3)
    for (let x = 0; x < 5; x++) {
      this.symbols[x] = [];

      for (let y = 0; y < 3; y++) {
        const text = this.add.text(200 + x * 120, 150 + y * 100, '-', {
          fontSize: '40px',
          color: '#ffffff',
        });

        this.symbols[x][y] = text;
      }
    }

    // Spin button
    this.spinButton = this.add
      .text(100, 500, 'SPIN', {
        fontSize: '48px',
        backgroundColor: '#2a1b3d',
        padding: { x: 30, y: 15 },
      })
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => {
        spin();
        this.playSpinAnimation();
      });

    this.render();
  }

  public update(): void {
    tick();
    this.render();
  }

  private render(): void {
    const view = getView();
    const grid = view.round.result?.grid;

    if (!grid) return;

    const key = JSON.stringify(grid);

    // prevent constant redraw spam
    if (key === this.lastGridKey) return;

    this.lastGridKey = key;

    for (let x = 0; x < grid.length; x++) {
      for (let y = 0; y < grid[x].length; y++) {
        this.symbols[x][y].setText(grid[x][y]);
      }
    }
  }

  private playSpinAnimation(): void {
    this.symbols.forEach((col, x) => {
      col.forEach((symbol, y) => {
        this.tweens.add({
          targets: symbol,
          y: symbol.y + 40,
          duration: 100,
          yoyo: true,
          ease: 'Quad.easeInOut',
          delay: x * 100,
        });
      });
    });
  }
}
