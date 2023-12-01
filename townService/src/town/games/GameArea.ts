import UnoPlayer from '../../lib/UnoPlayer';
import Player from '../../lib/Player';
import {
  GameArea as GameAreaModel,
  GameResult,
  GameState,
  Interactable,
  GameInstance,
  UnoMove
} from '../../types/CoveyTownSocket';
import InteractableArea from '../InteractableArea';
import Game from './Game';

/**
 * A GameArea is an InteractableArea on the map that can host a game.
 * At any given point in time, there is at most one game in progress in a GameArea.
 */
export default abstract class GameArea<
  GameType extends Game<GameState, unknown>,
> extends InteractableArea {
  protected _game?: GameType;

  protected _history: GameResult[] = [];

  public get game(): GameType | undefined {
    return this._game;
  }

  public get history(): GameResult[] {
    return this._history;
  }
  
  public toModel(): GameAreaModel<GameType['state']> {
    return {
      id: this.id,
      game: this._game?.toModel(),
      occupants: this.occupantsByID,
      type: this.getType(),
    };
  }
  
 
  public get isActive(): boolean {
    return (this.id !== null);
  }

  protected abstract getType(): Interactable;

  public remove(player: Player): void {

    if (this._game) {
      const playerToRemove = this._game._players.find(unoPlayer => unoPlayer.id === player.id);
      if(playerToRemove)
        this._game.leave(playerToRemove);
    }
    super.remove(player);
  }
}
