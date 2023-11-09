import TownController from '../../../classes/TownController';
import { BoundingBox } from '../../../types/CoveyTownSocket';
import Interactable, { KnownInteractableTypes } from '../Interactable';
import TownGameScene from '../TownGameScene';

export default class UnoArea extends Interactable {
  private _unoGameText?: Phaser.GameObjects.Text;
  private _townController: TownController;

  constructor(scene: TownGameScene) {
    super(scene);
    this._townController = scene.coveyTownController;
    this.setTintFill(0x1abc9c); 
    this.setAlpha(0.3);

    this._townController.addListener('unoGameChanged', this._updateUnoGame);
  }

  getType(): KnownInteractableTypes {
    return 'unoGame'; // Define a new type for the UNO area
  }

  removedFromScene(): void {
    // Handle cleanup if necessary when the UNO area is removed from the scene
  }

  addedToScene(): void {
    super.addedToScene();
    this._unoGameText = this.scene.add.text(
      this.x - this.displayWidth / 2,
      this.y - this.displayHeight / 2,
      'UNO Game Area',
      { color: '#FFFFFF', backgroundColor: '#000000' },
    );
    // Additional setup for the UNO game could go here
  }

  private _updateUnoGame(/* parameters to update the UNO game */) {
    // Update the UNO game state and display based on the current game status
    // This could involve showing the current player's turn, scores, etc.
  }

  public getBoundingBox(): BoundingBox {
    // This method may stay the same as in ConversationArea
    const { x, y, width, height } = this.getBounds();
    return { x, y, width, height };
  }

  overlap(): void {
    // Handle what happens when a player overlaps with the UNO area
    // This could involve showing instructions, starting a game, etc.
  }

  overlapExit(): void {
    // Handle what happens when a player exits the overlap with the UNO area
    // This could involve hiding instructions, pausing a game, etc.
  }
}
