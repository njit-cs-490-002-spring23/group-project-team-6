import Player from '../../lib/Player';
import { GameMove, UnoGameState, UnoMove } from '../../types/CoveyTownSocket';
import Game from './Game';

/**
 * A Uno is a Game that implements the rules of Uno.
 * @see https://en.wikipedia.org/wiki/Uno_(card_game)
 */
export default class UnoGame extends Game<UnoGameState, UnoMove> {
  public constructor() {
    super({
        mostRecentMove: null,
        currentPlayerMove: '', //need to implement
        status: 'WAITING_TO_START',
        numberOfMovesSoFar: 0,
    });
  }
  public applyMove(move: GameMove<UnoMove>): void {
    
  }
  public _join(player: Player): void {

  }
  public _leave(player: Player): void {
    
  }

}