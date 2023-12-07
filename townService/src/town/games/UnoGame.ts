import Game from './Game';
import InvalidParametersError, {
  PLAYER_ALREADY_IN_GAME_MESSAGE,
  PLAYER_NOT_IN_GAME_MESSAGE,
  INVALID_MOVE_MESSAGE,
  GAME_FULL_MESSAGE,
  GAME_NOT_IN_PROGRESS_MESSAGE,
  NOT_YOUR_TURN_MESSAGE,
} from '../../lib/InvalidParametersError';
import {
  DeckOfCards,
  UnoGameState,
  GameMove,
  UnoMove,
  Card,
  Color,
  Value,
  PlayerID,
  UnoGameDirection,
  Direction,
} from '../../types/CoveyTownSocket';
import UnoPlayer from '../../lib/UnoPlayer';
import Player from '../../lib/Player';

const MAX_PLAYERS = 6;
const MIN_PLAYERS = 2;

/**
 * A Uno is a Game that implements the rules of Uno.
 * @see https://en.wikipedia.org/wiki/Uno_(card_game)
 */
export default class UnoGame extends Game<UnoGameState, UnoMove> {
  deckOfCards: DeckOfCards;

  cardImages: string[];

  discardPile: DeckOfCards;

  public constructor() {
    super({
      mostRecentMove: undefined,
      currentMovePlayer: undefined,
      status: 'WAITING_TO_START',
      numberOfMovesSoFar: 0,
      currentColor: 'None',
      currentCardValue: 'None',
      direction: 'Counter_Clockwise',
      playersHands: [],
      players: [],
    });
    this.deckOfCards = [];
    this.cardImages = [];
    this.discardPile = [];
  }

  // getters and setters for UnoGameState - Used for testing not in game.

  get mostRecentMove(): UnoMove | undefined {
    return this.state.mostRecentMove;
  }

  set mostRecentMove(mostRecentMove: UnoMove | undefined) {
    this.state = {
      ...this.state,
      mostRecentMove,
    };
  }

  get currentMovePlayer(): PlayerID {
    return this.state.currentMovePlayer || "";
  }

  set currentMovePlayer(currentMovePlayer: PlayerID) {
    this.state = {
      ...this.state,
      currentMovePlayer,
    };
  }

  get currentColor(): Color {
    return this.state.currentColor;
  }

  set currentColor(currentColor: Color) {
    this.state = {
      ...this.state,
      currentColor,
    };  
  }

  get numberOfMovesSoFar(): number {
    return this.state.numberOfMovesSoFar;
  }

  set numberOfMovesSoFar(numberOfMovesSoFar: number) {
    this.state = {
      ...this.state,
      numberOfMovesSoFar,
    };   
  }

  get currentCardValue(): Value {
    return this.state.currentCardValue;
  }

  set currentCardValue(currentCardValue: Value) {
    this.state = {
      ...this.state,
      currentCardValue,
    };  
  }

  get direction(): UnoGameDirection {
    return this.state.direction;
  }

  set direction(direction: UnoGameDirection) {
    this.state = {
      ...this.state,
      direction,
    };  
  }

  // public methods to be used in game

  // eslint-disable-next-line class-methods-use-this
  public playerReadyUp(player: UnoPlayer): void {
    player.readyUp = !player.readyUp;
  }

  public get NextPlayerID(): PlayerID {
    return this._getNextPlayer()?.id || "";
  }

  public _dealCards(): void {
    this._shuffleDeck();
    for (let i = 0; i < 7; i++) {
      for (let j = 0; j < this._unoPlayers.length; j++) {
        this.drawFromDeck(this._unoPlayers[j]);
      }
    }
  }

  public drawFromDeck(player: UnoPlayer): void {
    let card = this.deckOfCards.pop();
    const playersHandsArray = this.state.playersHands;
    const index = this._players.findIndex((p) => p.id === player.id);
    const cardList = playersHandsArray[index];
    if (card) {
      player.cardsInHand?.push(card);
      if (cardList) {
        cardList.push(card);
        playersHandsArray[index] = cardList;
        this.state = {
          ...this.state,
          playersHands: playersHandsArray,
        }
      }
      else {
        throw new InvalidParametersError(PLAYER_NOT_IN_GAME_MESSAGE);
      }
      this.discardPile.push(card);
    } else if (this.discardPile) {
      this.deckOfCards = [...this.discardPile];
      card = this.deckOfCards.pop();
      if (card) {
        player.cardsInHand?.push(card);
        this.discardPile.push(card);
        if (cardList) {
          cardList.push(card);
          playersHandsArray[index] = cardList;
          this.state = {
            ...this.state,
            playersHands: playersHandsArray,
          }
        }  
      } else {
        throw new InvalidParametersError(GAME_NOT_IN_PROGRESS_MESSAGE);
      }
    } else {
      throw new InvalidParametersError(GAME_NOT_IN_PROGRESS_MESSAGE);
    }
  }

  public updateColor(color: Color): void {
    this.state = {
      ...this.state,
      currentColor: color,
    };
  }

  public getCardImages(): string[] {
    return this.cardImages;
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
  public applyMove(move: GameMove<UnoMove>): void {
    const [first] = this._players[0].id;
    if (!this.state.currentMovePlayer || this.state.currentMovePlayer === "") {
      this.state = {
        ...this.state,
        currentMovePlayer: first,
      }; 
    }
    if (move.playerID !== this.state.currentMovePlayer) {
      throw new InvalidParametersError(NOT_YOUR_TURN_MESSAGE);
    }
    if (move.move.cardPlaced.value === 'Wild') this._wildCardPlaced(move.move);
    else if (move.move.cardPlaced.value === 'Wild Draw Four')
      this._wildDrawfourCardPlaced(move.move);
    else if (
      this.state.currentColor === move.move.cardPlaced.color ||
      this.state.currentColor === 'None' ||
      this.state.currentCardValue === 'None'
    ) {
      this.updateColor(move.move.cardPlaced.color);
      if (move.move.cardPlaced.value === 'Draw Two') this._drawtwoCardPlaced(move.move);
      else if (move.move.cardPlaced.value === 'Skip') this._skipCardPlaced(move.move);
      else if (move.move.cardPlaced.value === 'Reverse') this._reverseCardPlaced(move.move);
      else {
        this._applyMoveUpdateGameState(move.move);
      }
    } else {
      throw new InvalidParametersError(INVALID_MOVE_MESSAGE);
    }
    this.state.numberOfMovesSoFar++;
  }

  public _join(player: UnoPlayer): void {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    if (this._unoPlayers.some(existingPlayer => existingPlayer.id === player.id)) {
      throw new Error(PLAYER_ALREADY_IN_GAME_MESSAGE);
    }
    if (this._unoPlayers.length >= MAX_PLAYERS) {
      throw new Error(GAME_FULL_MESSAGE);
    }
    this._unoPlayers.push(player);
    const index = this._players.findIndex((p) => p.id === player.id);
    const playersHandsArray: Card[][] = this.state.playersHands;
    playersHandsArray[index] = [];
    const playerIdList: PlayerID[] = this.state.players;
    playerIdList.push(player.id);
    this.state = {
      ...this.state,
      playersHands: playersHandsArray,
      players: playerIdList,
      status: 'WAITING_TO_START',
    };
    if (this._unoPlayers.length === 1)
      this.state.currentMovePlayer = player.id; 
    this._updatePlayerPositions();
  }

  public _leave(player: UnoPlayer): void {
    const playerIndex = this._players.findIndex(p => p.id === player.id);

    if (playerIndex === -1) {
      throw new Error(PLAYER_NOT_IN_GAME_MESSAGE);
    }
    this._players.splice(playerIndex, 1);
    this._unoPlayers.splice(playerIndex, 1);
    const playersHandsArray: Card[][]= this.state.playersHands;
    const playerIdList: PlayerID[] = this.state.players;
    playerIdList.splice(playerIndex, 1);
    playersHandsArray.splice(playerIndex, 1);
    this.state = {
      ...this.state,
      playersHands: playersHandsArray,
      players: playerIdList,
    }; 
    this._updatePlayerPositions();

    if (this.state.status === 'IN_PROGRESS' && this._players.length < MIN_PLAYERS) {
      this.state = {
        ...this.state,
        status: 'OVER',
      }; 

      if (this._players.length === 1) {
        this.state = {
          ...this.state,
          winner: this._players[0].id,
        }; 
      } else {
        this.state = {
          ...this.state,
          status: 'WAITING_TO_START',
          winner: undefined,
        };
      }
    }
  }

  // private methods used by class

  public shuffleAndDealCards(): boolean {
    let allPlayersReady = true;
    for (let j = 0; j < this._unoPlayers.length; j++) {
      if (!this._unoPlayers[j].readyUp) {
        allPlayersReady = false;
        break;
      }
    }
    if (allPlayersReady) {
      this._createDeck();
      this._shuffleDeck();
      this._dealCards();
      this.state = {
        ...this.state,
        status: 'IN_PROGRESS',
      };
      return true;
    }
    return false;
  }

  private _createDeck(): void {
    const colors: Color[] = ['Red', 'Green', 'Blue', 'Yellow'];
    const values: Value[] = [
      '0',
      '1',
      '2',
      '3',
      '4',
      '5',
      '6',
      '7',
      '8',
      '9',
      'Skip',
      'Reverse',
      'Draw Two',
    ];
    const createSrc = (color: Color, value: Value) =>
      `/assets/images/uno_assets_2d/PNGs/small/${color.toLowerCase()}_${value}.png`;
    const wildCard: Card = {
      color: 'None',
      value: 'Wild',
      src: '/assets/images/uno_assets_2d/PNGs/small/wild_color_changer.png',
    };
    const wildDrawFourCard: Card = {
      color: 'None',
      value: 'Wild Draw Four',
      src: '/assets/images/uno_assets_2d/PNGs/small/wild_pick_four.png',
    };
    colors.forEach(color => {
      values.forEach(value => {
        const src = createSrc(color, value);
        for (let i = 0; i < 4; i++) {
          this.deckOfCards.push({ color, value, src });
          this.cardImages.push(src);
        }
      });
    });
    this.deckOfCards.push(wildCard);
    this.cardImages.push(wildCard.src); // Push the wild card src
    this.deckOfCards.push(wildCard);
    this.cardImages.push(wildCard.src); // Push the wild card src
    this.deckOfCards.push(wildDrawFourCard);
    this.cardImages.push(wildDrawFourCard.src); // Push the wild draw four card src
    this.deckOfCards.push(wildDrawFourCard);
    this.cardImages.push(wildDrawFourCard.src);
  }

  private _updatePlayerPositions(): void {
    this._unoPlayers.forEach((player, index, arr) => {
      player.playerToLeft = arr[(index + arr.length - 1) % arr.length];
      player.playerToRight = arr[(index + 1) % arr.length];
    });
  }

  private _checkIfWinningMove(): void {
    const player: UnoPlayer | undefined = this._unoPlayers.find(_player => _player.id === this.state.currentMovePlayer);
    if (player && player.cardsInHand.length === 0) {
      this.state = {
        ...this.state,
        status: 'OVER',
        winner: this.state.currentMovePlayer,
      };
    }
  }

  private _getNextPlayer(): UnoPlayer | undefined {
    const player: UnoPlayer | undefined = this._unoPlayers.find(_player => _player.id === this.state.currentMovePlayer);
    if (player && player.playerToRight && player.playerToLeft){
      return this.state.direction === 'Counter_Clockwise'
      ? player.playerToRight
      : player.playerToLeft;
    }
      throw new InvalidParametersError(PLAYER_NOT_IN_GAME_MESSAGE);
  }

  private _applyMoveUpdateGameState(move: UnoMove): void {
    const player: UnoPlayer | undefined = this._unoPlayers.find(_player => _player.id === this.state.currentMovePlayer);
    if (player){
      const index = this._players.findIndex((p) => p.id === player.id);
      let cardList: Card[] | undefined;
      if (this.state.currentMovePlayer){
        cardList = this.state.playersHands[index];
        cardList = cardList?.filter((card: Card) => card !== move.cardPlaced);
        const playersHandsArray: Card[][] = this.state.playersHands;
        playersHandsArray[index] = cardList || [];
        this.state = {
          ...this.state,
          playersHands: playersHandsArray,
          mostRecentMove: move,
          currentCardValue: move.cardPlaced.value
        }
        player.cardsInHand = player.cardsInHand.filter(
          (card: Card) => card !== move.cardPlaced,
        );  
      }
    }
    this._checkIfWinningMove();
    this.state = {
      ...this.state,
      currentMovePlayer: this._getNextPlayer()?.id,
    }
  }

  private _wildCardPlaced(move: UnoMove): void {
    this.state = {
      ...this.state,
      currentColor: move.cardPlaced.color,
    }
    this._applyMoveUpdateGameState(move);
  }

  private _wildDrawfourCardPlaced(move: UnoMove): void {
    const player = this._getNextPlayer();
    if (player){
      for (let i = 0; i < 4; i++) {
        this.drawFromDeck(player);
      }
      this._applyMoveUpdateGameState(move);
      this.state = {
        ...this.state,
        currentMovePlayer: player.id,
      }
    }
  }

  private _drawtwoCardPlaced(move: UnoMove): void {
    const player = this._getNextPlayer();
    if (player) {
      for (let i = 0; i < 2; i++) {
        this.drawFromDeck(player);
      }
      this._applyMoveUpdateGameState(move);
      this.state = {
        ...this.state,
        currentMovePlayer: player.id,
      }  
    }
  }

  private _skipCardPlaced(move: UnoMove): void {
    this._applyMoveUpdateGameState(move);
    const player = this._getNextPlayer();
    if (player)
      this.state = {
        ...this.state,
        currentMovePlayer: player.id,
    }
  }

  private _reverseCardPlaced(move: UnoMove): void {
    const direction: UnoGameDirection = this.state.direction === 'Clockwise' ? 'Counter_Clockwise' : 'Clockwise';
    this.state = {
      ...this.state,
      direction,
    }
    this._applyMoveUpdateGameState(move);
  }

  // Fisher-Yates shuffle
  private _shuffleDeck(): void {
    for (let i = this.deckOfCards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.deckOfCards[i], this.deckOfCards[j]] = [this.deckOfCards[j], this.deckOfCards[i]];
    }
  }
}
