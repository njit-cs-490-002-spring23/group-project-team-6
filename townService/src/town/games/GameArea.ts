/*
 * This section of code is adapted from or inspired by code available on GitHub:
 * Repository: https://github.com/neu-se/covey.town
 * File: covey.town/townService/src/town/games/GameArea.ts
 * Author: Jonathan Bell
 */
import Player from '../../lib/Player';
import {
  GameArea as GameAreaModel,
  GameResult,
  GameState,
  Interactable,
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
      history: this.history,
    };
  }
  
 
  public get isActive(): boolean {
    return (this.id !== null);
  }

  protected abstract getType(): Interactable;

  public remove(player: Player): void {

    if (this._game) {
      this._game.leave(player);
    }
    super.remove(player);
  }
}
