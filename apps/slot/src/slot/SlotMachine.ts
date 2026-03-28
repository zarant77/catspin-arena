import Phaser from 'phaser';
import { SLOT_SYMBOL_IDS, SLOT_SYMBOL_VIEW, type SlotSymbolId } from '@catspin/assets';

type ReelCell = {
  readonly frame: Phaser.GameObjects.Image;
  symbolId: SlotSymbolId;
};

const REELS_COUNT = 5;
const ROWS_COUNT = 3;
const CELL_SIZE = 140;
const REEL_GAP = 10;

const MACHINE_X = 640;
const MACHINE_Y = 355;

const MACHINE_WIDTH = REELS_COUNT * CELL_SIZE + (REELS_COUNT - 1) * REEL_GAP;
const MACHINE_HEIGHT = ROWS_COUNT * CELL_SIZE;

const GRID_LEFT = MACHINE_X - MACHINE_WIDTH / 2 + CELL_SIZE / 2;
const GRID_TOP = MACHINE_Y - MACHINE_HEIGHT / 2 + CELL_SIZE / 2;

const SPIN_SPEED = 1200;
const STOP_DELAY_MS = 160;
const PRE_STOP_DELAY_MS = 900;

function randomSymbol(): SlotSymbolId {
  const index = Math.floor(Math.random() * SLOT_SYMBOL_IDS.length);
  return SLOT_SYMBOL_IDS[index];
}

function getCellX(reelIndex: number): number {
  return GRID_LEFT + reelIndex * (CELL_SIZE + REEL_GAP);
}

function getCellY(rowIndex: number): number {
  return GRID_TOP + rowIndex * CELL_SIZE;
}

export class SlotMachine {
  private readonly scene: Phaser.Scene;
  private readonly reels: ReelCell[][] = [];
  private readonly reelMasks: Phaser.Display.Masks.GeometryMask[] = [];
  private readonly frameGraphics: Phaser.GameObjects.Rectangle[] = [];

  private isAnimatingSpin = false;
  private stopScheduled = false;
  private stopAtByReel: number[] = [];

  public constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  public preload(): void {
    for (const symbolId of SLOT_SYMBOL_IDS) {
      this.scene.load.image(symbolId, SLOT_SYMBOL_VIEW[symbolId]);
    }
  }

  public create(): void {
    this.createCabinet();
    this.createReels();
  }

  public startSpin(): void {
    this.isAnimatingSpin = true;
    this.stopScheduled = false;
    this.stopAtByReel = [];

    const baseTime = this.scene.time.now + PRE_STOP_DELAY_MS;

    for (let reelIndex = 0; reelIndex < REELS_COUNT; reelIndex += 1) {
      this.stopAtByReel.push(baseTime + reelIndex * STOP_DELAY_MS);
    }

    this.scene.cameras.main.shake(120, 0.0025);
  }

  public scheduleStop(): void {
    this.stopScheduled = true;
  }

  public update(delta: number): void {
    if (this.isAnimatingSpin === false) {
      return;
    }

    const now = this.scene.time.now;
    let allStopped = true;

    for (let reelIndex = 0; reelIndex < this.reels.length; reelIndex += 1) {
      const reel = this.reels[reelIndex];
      const shouldKeepSpinning = this.stopScheduled === false || now < this.stopAtByReel[reelIndex];

      if (shouldKeepSpinning === true) {
        allStopped = false;
        this.updateSingleReel(reel, delta);
      }
    }

    if (this.stopScheduled === true && allStopped === true) {
      this.isAnimatingSpin = false;
    }
  }

  public applyResolvedGrid(grid: readonly (readonly SlotSymbolId[])[]): void {
    for (let reelIndex = 0; reelIndex < grid.length; reelIndex += 1) {
      const reel = this.reels[reelIndex];
      const column = grid[reelIndex];

      for (let rowIndex = 0; rowIndex < column.length; rowIndex += 1) {
        const symbolId = column[rowIndex];
        const cell = reel[rowIndex];

        cell.symbolId = symbolId;
        cell.frame.setTexture(symbolId);
        cell.frame.setPosition(getCellX(reelIndex), getCellY(rowIndex));
      }

      reel.sort((left, right) => left.frame.y - right.frame.y);
    }
  }

  public highlightWinningLine(line: readonly number[]): void {
    const points = line.map((rowIndex, reelIndex) => {
      return new Phaser.Math.Vector2(getCellX(reelIndex), getCellY(rowIndex));
    });

    const glow = this.scene.add.graphics();
    glow.lineStyle(14, 0xffd166, 0.25);
    glow.beginPath();
    glow.moveTo(points[0].x, points[0].y);

    for (let index = 1; index < points.length; index += 1) {
      glow.lineTo(points[index].x, points[index].y);
    }

    glow.strokePath();

    const lineGraphics = this.scene.add.graphics();
    lineGraphics.lineStyle(6, 0xfff2a8, 0.95);
    lineGraphics.beginPath();
    lineGraphics.moveTo(points[0].x, points[0].y);

    for (let index = 1; index < points.length; index += 1) {
      lineGraphics.lineTo(points[index].x, points[index].y);
    }

    lineGraphics.strokePath();

    this.scene.tweens.add({
      targets: [glow, lineGraphics],
      alpha: { from: 0, to: 1 },
      yoyo: true,
      repeat: 1,
      duration: 240,
      onComplete: () => {
        glow.destroy();
        lineGraphics.destroy();
      },
    });
  }

  private createCabinet(): void {
    this.scene.add.rectangle(640, 360, 1280, 720, 0x12081f);

    this.scene.add
      .rectangle(MACHINE_X, MACHINE_Y, MACHINE_WIDTH + 44, MACHINE_HEIGHT + 44, 0x26113b, 1)
      .setStrokeStyle(4, 0xffd166, 0.95);

    this.scene.add
      .rectangle(MACHINE_X, MACHINE_Y, MACHINE_WIDTH + 12, MACHINE_HEIGHT + 12, 0x140b22, 1)
      .setStrokeStyle(2, 0xffffff, 0.08);

    this.scene.add
      .rectangle(MACHINE_X, MACHINE_Y, MACHINE_WIDTH, MACHINE_HEIGHT, 0x10061b, 1)
      .setStrokeStyle(2, 0xffffff, 0.04);
  }

  private createReels(): void {
    for (let reelIndex = 0; reelIndex < REELS_COUNT; reelIndex += 1) {
      const reelX = getCellX(reelIndex);
      const cells: ReelCell[] = [];

      const maskShape = this.scene.make.graphics({ x: 0, y: 0 }, false);
      maskShape.fillStyle(0xffffff, 1);
      maskShape.fillRect(reelX - CELL_SIZE / 2, MACHINE_Y - MACHINE_HEIGHT / 2, CELL_SIZE, MACHINE_HEIGHT);

      const mask = maskShape.createGeometryMask();
      this.reelMasks.push(mask);

      for (let rowIndex = 0; rowIndex < ROWS_COUNT; rowIndex += 1) {
        const reelY = getCellY(rowIndex);
        const symbolId = randomSymbol();

        const bg = this.scene.add.rectangle(reelX, reelY, CELL_SIZE - 10, CELL_SIZE - 10, 0x1c0d2d, 0.9);
        bg.setStrokeStyle(2, 0xffffff, 0.07);
        this.frameGraphics.push(bg);

        const frame = this.scene.add.image(reelX, reelY, symbolId);
        frame.setDisplaySize(100, 100);
        frame.setMask(mask);

        cells.push({
          frame,
          symbolId,
        });
      }

      this.reels.push(cells);
    }
  }

  private updateSingleReel(reel: ReelCell[], delta: number): void {
    const offset = (SPIN_SPEED * delta) / 1000;
    const wrapTop = MACHINE_Y - MACHINE_HEIGHT / 2 - CELL_SIZE / 2;
    const wrapBottom = MACHINE_Y + MACHINE_HEIGHT / 2 + CELL_SIZE / 2;
    const cycleHeight = ROWS_COUNT * CELL_SIZE;

    for (const cell of reel) {
      cell.frame.y += offset;

      if (cell.frame.y >= wrapBottom) {
        cell.frame.y -= cycleHeight;
        cell.symbolId = randomSymbol();
        cell.frame.setTexture(cell.symbolId);
      }
    }

    reel.sort((left, right) => left.frame.y - right.frame.y);

    for (let index = 0; index < reel.length; index += 1) {
      const expectedY = wrapTop + CELL_SIZE + index * CELL_SIZE;
      const current = reel[index];

      if (Math.abs(current.frame.y - expectedY) < 10) {
        current.frame.y = expectedY;
      }
    }
  }
}
