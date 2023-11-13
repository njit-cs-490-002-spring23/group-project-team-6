import Game from './Game';
import InvalidParametersError, {
  PLAYER_ALREADY_IN_GAME_MESSAGE,
  PLAYER_NOT_IN_GAME_MESSAGE,
  INVALID_MOVE_MESSAGE,
  GAME_FULL_MESSAGE,
  GAME_HASNT_STARTED_MESSAGE,
} from '../../lib/InvalidParametersError';
import {
  DeckOfCards, 
  UnoGameState,
  GameMove,
  UnoMove,
  Card,
  Color,
  Value
} from '../../types/CoveyTownSocket';
<<<<<<< HEAD
import UnoPlayer from '../../lib/UnoPlayer';

const MAX_PLAYERS = 6;
=======
import InvalidParametersError, {
  GAME_FULL_MESSAGE,
  GAME_NOT_IN_PROGRESS_MESSAGE,
  MOVE_NOT_YOUR_TURN_MESSAGE,
  PLAYER_ALREADY_IN_GAME_MESSAGE,
  PLAYER_NOT_IN_GAME_MESSAGE,
} from '../../lib/InvalidParametersError';
import Game from './Game';
>>>>>>> main

const MAX_PLAYERS = 6;
/**
 * A Uno is a Game that implements the rules of Uno.
 * @see https://en.wikipedia.org/wiki/Uno_(card_game)
 */
export default class UnoGame extends Game<UnoGameState, UnoMove> {
  deckOfCards: DeckOfCards;
  discardPile: DeckOfCards;
  public constructor() {
    super({
        mostRecentMove: null,
        currentMovePlayer: null, 
        status: 'WAITING_TO_START',
        numberOfMovesSoFar: 0,
        currentColor: 'None',
        currentCardValue: 'None',
        direction: 'Counter_Clockwise',
    });
    this.deckOfCards = [];
    this.discardPile = [];
  }

  public playerReadyUp(player: UnoPlayer): void {
    player.readyUp = !player.readyUp;
  }

  public checkIfPlayersReady(): boolean {
    let bool: Boolean = true;
    for (let j = 0; j < this._players.length; j++){
      if(!this._players[j].readyUp)
        return false;
    } 
    this.state.status = 'IN_PROGRESS';
    this.createDeck();
    this._shuffleDeck();
    this.dealCards();
    return true;
  }

  public createDeck(): void {
    const colors: Color[] = ['Red', 'Green', 'Blue', 'Yellow'];
    const values: Value[] = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'Skip', 'Reverse', 'Draw Two'];
    const wildCard: Card = {
      color: 'None',
      value: 'Wild'
    }
    const wildDrawFourCard: Card = {
      color: 'None',
      value: 'Wild Draw Four'
    }
    colors.forEach(color => {
      values.forEach(value => {
        for (let i = 0; i < 4; i++) {
          this.deckOfCards.push({ color, value });
        }
      });
    });
    this.deckOfCards.push(wildCard);
    this.deckOfCards.push(wildCard);
    this.deckOfCards.push(wildDrawFourCard);
    this.deckOfCards.push(wildDrawFourCard);
  }
  public dealCards(): void {
    this._shuffleDeck();
    for (let i = 0; i < 7; i++){
      for (let j = 0; j < this._players.length; j++){
        this.drawFromDeck(this._players[j]);
      }
    }
  }

  public drawFromDeck(player: UnoPlayer): void {
    let card = this.deckOfCards.pop();
    if (card) {
      player.cardsInHand?.push(card);
      this.discardPile.push(card);
    }
    else if (this.discardPile){
      this.deckOfCards = [...this.discardPile];
      card = this.deckOfCards.pop();
      if (card){
        player.cardsInHand?.push(card);
        this.discardPile.push(card);
      }
      else{
        throw new InvalidParametersError(GAME_HASNT_STARTED_MESSAGE);
      }
    }
    else{
      throw new InvalidParametersError(GAME_HASNT_STARTED_MESSAGE);
    }
  }

  public updateColor(color: Color): void {
    this.state.currentColor = color;
  }

  /*
   * Applies a player's move to the game.
   * Validates the move before applying it. If the move is invalid, throws an InvalidParametersError with
   * the error message specified below.
   * A move is invalid if:
   *    - The Card placed is not the appropriate color or number (use INVALID_CARD_MESSAGE)
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
<<<<<<< HEAD
  public applyMove(move: GameMove<UnoMove>): void {
    if (!this.state.currentMovePlayer)
      this.state.currentMovePlayer = this._players[0];
    if (move.move.cardPlaced.value === 'Wild')
      this._wildCardPlaced(move.move);
    else if (move.move.cardPlaced.value === 'Wild Draw Four')
      this._wildDrawfourCardPlaced(move.move);
    else if (this.state.currentColor === move.move.cardPlaced.color || this.state.currentCardValue === move.move.cardPlaced.value){
      this.updateColor(move.move.cardPlaced.color);
      if (move.move.cardPlaced.value === 'Draw Two')
        this._drawtwoCardPlaced(move.move);
      else if (move.move.cardPlaced.value === 'Skip')
        this._skipCardPlaced(move.move);
      else if (move.move.cardPlaced.value === 'Reverse')
        this._reverseCardPlaced(move.move);
      else{
        this._applyMoveUpdateGameState(move.move);
=======
  public applyMove(move: UnoMove): void {
    const playerIDList: string[] = this._players.map(player => player.id);
    let playerToRight: UnoPlayer;
    let playerToLeft: UnoPlayer;
    if (this._players.length > 0) { // Changed logic to account for destructuring
      if (!this.state.currentMovePlayer) {
        [this.state.currentMovePlayer] = this._players;
      }
      const currentIndex = this._players.indexOf(this.state.currentMovePlayer);
    
      const playerToRightIndex = (currentIndex + 1) % this._players.length;
      const playerToLeftIndex = (currentIndex - 1 + this._players.length) % this._players.length;
    
      playerToRight = this._players[playerToRightIndex];
      playerToLeft = this._players[playerToLeftIndex];
    } else {
      this.state.currentMovePlayer = null;
    }
    
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
>>>>>>> main
      }
    }
    else{
      throw new InvalidParametersError(INVALID_MOVE_MESSAGE);
    }
    this.state.numberOfMovesSoFar++;
  }

  public _join(player: UnoPlayer): void {
    if (this._players.includes(player)) {
      throw new Error(PLAYER_ALREADY_IN_GAME_MESSAGE);
    }
    if (this._players.length >= MAX_PLAYERS) {
      throw new Error(GAME_FULL_MESSAGE);
    }
    this._updatePlayerPositions();
    this.state.status = 'WAITING_TO_START';
  }
<<<<<<< HEAD
  
  public _leave(player: UnoPlayer): void {
    const playerIndex = this._players.findIndex(p => p.id === player.id);

    if (playerIndex === -1) {
      throw new Error(PLAYER_NOT_IN_GAME_MESSAGE);
    }
    this._players.splice(playerIndex, 1);

    this._updatePlayerPositions();
  }

  private _updatePlayerPositions(): void {
    this._players.forEach((player, index, arr) => {
      player.playerToLeft = arr[(index + arr.length - 1) % arr.length];
      player.playerToRight = arr[(index + 1) % arr.length];
    });
  }

  private _checkIfWinningMove() : void {
    if (this.state.currentMovePlayer.cardsInHand.length() === 0){
      this.state = {
        ...this.state,
        status: 'OVER',
        winner: this.state.currentMovePlayer
      };
    } 
  }

  private _getNextPlayer(): UnoPlayer {
    return this.state.direction === 'Clockwise' ? this.state.currentMovePlayer.playerToRight : this.state.currentMovePlayer.playerToLeft;
  }

  private _applyMoveUpdateGameState(move: UnoMove){
    this.state.currentMovePlayer.cardsInHand = this.state.currentMovePlayer.cardsInHand.filter((card: Card) => card === move.cardPlaced);
    this.state.mostRecentMove = move;
    this.state.currentCardValue = move.cardPlaced.value;
    this._checkIfWinningMove();
    this.state.currentMovePlayer = this._getNextPlayer();
  }

  private _wildCardPlaced(move: UnoMove) : void {
    this._applyMoveUpdateGameState(move);
    this.state.currentMovePlayer = this._getNextPlayer();
  }

  private _wildDrawfourCardPlaced(move: UnoMove) : void {
    for (let i = 0; i < 4; i++){
      this.drawFromDeck(this._getNextPlayer());
    }
    this._applyMoveUpdateGameState(move);
    this.state.currentMovePlayer = this._getNextPlayer();
  }

  private _drawtwoCardPlaced(move: UnoMove) : void {
    for (let i = 0; i < 2; i++){
      this.drawFromDeck(this._getNextPlayer());
    }
    this._applyMoveUpdateGameState(move);
    this.state.currentMovePlayer = this._getNextPlayer();
  }

  private _skipCardPlaced(move: UnoMove) : void {
    this._applyMoveUpdateGameState(move);
    this.state.currentMovePlayer = this._getNextPlayer();
  }

  private _reverseCardPlaced(move: UnoMove) : void {
    this.state.direction = this.state.direction === "Clockwise" ? "Counter_Clockwise" : "Clockwise";
    this._applyMoveUpdateGameState(move);
  }

  //Fisher-Yates shuffle
  private _shuffleDeck(): void {
    for (let i = this.deckOfCards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.deckOfCards[i], this.deckOfCards[j]] = [this.deckOfCards[j], this.deckOfCards[i]];
    }
=======

  private _updatePlayerPositions(): void {
    this._players.forEach((player, index, arr) => {
      player.playerToLeft = arr[(index + arr.length - 1) % arr.length];
      player.playerToRight = arr[(index + 1) % arr.length];
    });
  }

  public _leave(player: UnoPlayer): void {
    const playerIndex = this._players.findIndex(p => p.id === player.id);

    if (playerIndex === -1) {
      throw new Error(PLAYER_NOT_IN_GAME_MESSAGE);
    }
    this._players.splice(playerIndex, 1);

    this._updatePlayerPositions();
>>>>>>> main
  }
}