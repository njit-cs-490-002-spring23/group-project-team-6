import {
  DeckOfCards, 
  UnoPlayer, 
  UnoGameState, 
  UnoMove 
} from '../../types/CoveyTownSocket';
import Game from './Game';

/**
 * A Uno is a Game that implements the rules of Uno.
 * @see https://en.wikipedia.org/wiki/Uno_(card_game)
 */
export default class UnoGame extends Game<UnoGameState, UnoMove> {
  public constructor() {
    super({
        mostRecentMove: null,
        currentMovePlayer: null, //need to implement
        status: 'WAITING_TO_START',
        numberOfMovesSoFar: 0,
        currentColor: 'None',
        currentCardValue: 'None',
        direction: 'Counter_Clockwise',
    });
  }
  private checkIfWinningMove() : void {

  }
  private wildCardPlaced() : void {
    this.checkIfWinningMove();
  }
  private wildDrawfourCardPlaced() : void {
    this.checkIfWinningMove();
  }
  private drawtwoCardPlaced() : void {
    this.checkIfWinningMove();
  }
  private skipCardPlaced() : void {
    this.checkIfWinningMove();
  }
  private reverseCardPlaced() : void {
    this.checkIfWinningMove();
  }
  public createDeck() : DeckOfCards {
    return [];
  }
  public drawFromDeck(player: UnoPlayer) : void {
    
  }

  /*
   * Applies a player's move to the game.
   * Validates the move before applying it. If the move is invalid, throws an InvalidParametersError with
   * the error message specified below.
   * A move is invalid if:
   *    - The Card placed is not the appropriate color or number (use INVALID_CARD_MESSAGE)
   *    - The move is not the player's turn (MOVE_NOT_YOUR_TURN_MESSAGE)
   *
   * If the move is valid, applies the move to the game and updates the game state.
   *
   * If the move ends the game, updates the game's state.
   * If the move results in a win, updates the game's state to set the status to OVER and sets the winner to the player who made the move.
   * If the move results in a player only having, one card left, makes note that the player has UNO
   * A player wins if they have 0 cards left.
   *
   * @param move The move to apply to the game
   * @throws InvalidParametersError if the move is invalid (with specific message noted above)
   */
  public applyMove(move: UnoMove): void {
    const playerIDList: string[] = this._players.map(player => player.id);
    let playerToRight: UnoPlayer;
    let playerToLeft: UnoPlayer;
    if (this.state.currentMovePlayer){
      const currentIndex = this._players.indexOf(this.state.currentMovePlayer);
      playerToRight = this._players[(currentIndex + 1) % this._players.length];
      playerToLeft = this._players[(currentIndex - 1 + this._players.length) % this._players.length];  
    }
    else{
      this.state.currentMovePlayer = this._players[0];
      playerToRight = this._players[1];
      playerToLeft = this._players[-1];
    }
    if (!this.state.currentMovePlayer)
      this.state.currentMovePlayer = this._players[0];

    if (this.state.mostRecentMove){
      if (this.state.mostRecentMove.cardPlaced.value === 'Wild')
        this.wildCardPlaced();
      else if (this.state.mostRecentMove.cardPlaced.value === 'Wild Draw Four')
        this.wildDrawfourCardPlaced();
      else if (this.state.mostRecentMove.cardPlaced.value === 'Draw Two')
        this.drawtwoCardPlaced();
      else if (this.state.mostRecentMove.cardPlaced.value === 'Skip')
        this.skipCardPlaced();
      else if (this.state.mostRecentMove.cardPlaced.value === 'Reverse')
        this.reverseCardPlaced();
      else if (this.state.currentColor === move.cardPlaced.color || this.state.currentCardValue === move.cardPlaced.value){
        this.state.mostRecentMove = move;
        this.state.currentColor = move.cardPlaced.color;
        this.state.currentCardValue = move.cardPlaced.value;
        this.state.currentMovePlayer = this.state.direction ===  'Clockwise' ? playerToRight : playerToLeft;
        this.checkIfWinningMove();
      }
    }
    this.state.numberOfMovesSoFar++;
  
  }
  public _join(player: UnoPlayer): void {

  }
  public _leave(player: UnoPlayer): void {
    
  }

}