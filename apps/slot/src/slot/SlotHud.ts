import Phaser from 'phaser';

type SlotHudState = {
  readonly roundStatus: string;
  readonly balance: number;
  readonly winText: string;
  readonly canSpin: boolean;
};

export class SlotHud {
  private readonly scene: Phaser.Scene;
  private readonly onSpin: () => void;

  private spinButton!: Phaser.GameObjects.Zone;
  private spinButtonBg!: Phaser.GameObjects.Rectangle;
  private spinButtonLabel!: Phaser.GameObjects.Text;
  private statusText!: Phaser.GameObjects.Text;
  private winText!: Phaser.GameObjects.Text;
  private balanceText!: Phaser.GameObjects.Text;

  public constructor(scene: Phaser.Scene, onSpin: () => void) {
    this.scene = scene;
    this.onSpin = onSpin;
  }

  public create(): void {
    this.statusText = this.scene.add.text(120, 585, '', {
      fontFamily: 'Arial',
      fontSize: '24px',
      color: '#ffffff',
    });

    this.balanceText = this.scene.add.text(120, 620, '', {
      fontFamily: 'Arial',
      fontSize: '24px',
      color: '#8affc1',
    });

    this.winText = this.scene.add
      .text(640, 585, '', {
        fontFamily: 'Arial',
        fontSize: '32px',
        color: '#ffd166',
        fontStyle: 'bold',
      })
      .setOrigin(0.5, 0);

    this.spinButtonBg = this.scene.add.rectangle(1090, 610, 190, 72, 0x6622b5, 1).setStrokeStyle(4, 0xffd166, 1);

    this.spinButtonLabel = this.scene.add
      .text(1090, 610, 'SPIN', {
        fontFamily: 'Arial',
        fontSize: '30px',
        color: '#ffffff',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    this.spinButton = this.scene.add.zone(1090, 610, 190, 72).setInteractive({ useHandCursor: true });

    this.spinButton.on('pointerdown', () => {
      this.onSpin();
    });

    this.spinButton.on('pointerover', () => {
      this.spinButtonBg.setFillStyle(0x7a2de0, 1);
    });

    this.spinButton.on('pointerout', () => {
      this.spinButtonBg.setFillStyle(0x6622b5, 1);
    });
  }

  public render(state: SlotHudState): void {
    this.statusText.setText(`Round: ${state.roundStatus}`);
    this.balanceText.setText(`Balance: ${state.balance}`);
    this.winText.setText(state.winText);

    this.spinButtonBg.alpha = state.canSpin ? 1 : 0.5;
    this.spinButtonLabel.alpha = state.canSpin ? 1 : 0.65;
    this.spinButton.input!.enabled = state.canSpin;
  }

  public playWinPulse(): void {
    this.scene.tweens.add({
      targets: this.winText,
      scaleX: { from: 0.95, to: 1.08 },
      scaleY: { from: 0.95, to: 1.08 },
      yoyo: true,
      repeat: 2,
      duration: 180,
      ease: 'Quad.Out',
    });
  }

  public clearWinText(): void {
    this.winText.setText('');
  }
}
