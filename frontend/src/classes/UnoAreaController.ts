/*
 * This section of code is adapted from or inspired by code available on GitHub:
 * Repository: https://github.com/neu-se/covey.town
 * File: covey.town/townService/src/town/games/TicTacToeAreaController.ts
 * Author: Jonathan Bell
 */
import {
  GameArea,
  GameStatus,
  UnoGameState,
  Card,
  DeckOfCards,
  Color,
  Value,
  UnoMove,
  PlayerID,
  PlayerHands2DArray,
} from '../types/CoveyTownSocket';
import { BASE_PATH, CARD_BACK_IMAGE } from '../components/Town/interactables/UnoTable';
import PlayerController from './PlayerController';
import GameAreaController, { GameEventTypes } from './GameAreaController';

export const PLAYER_NOT_IN_UNO_GAME_ERROR = 'Player is not in Uno game';
export const NO_UNO_GAME_IN_PROGRESS_ERROR = 'No Uno game in progress';
export const INVALID_CARD_PLAYED_ERROR = 'Card can not be played';
export const NO_GAME_IN_PROGRESS_ERROR = 'No game in progress';
export const READY_STATUS = false;
export const noCard: Card = {
  color: 'None',
  value: 'None',
  src: '',
};

export type UnoEvents = GameEventTypes & {
  deckChanged: (deck: DeckOfCards) => void;
  turnChanged: (isOurTurn: boolean) => void;
  colorChanged: (color: Color) => void;
  valueChanged: (value: Value) => void;
  skippedPlaces: () => void;
};

/**
 * Controller for managing the Uno game area within the application.
 * It handles game logic, player interactions, and maintains the game state.
 * @extends GameAreaController
 */
export default class UnoAreaController extends GameAreaController<UnoGameState, UnoEvents> {
  private _deck: DeckOfCards = [];

  private _currentCard: DeckOfCards = [];

  private _playerHands: DeckOfCards = [];

  public colorChange = false;

  public justPlayedPlayerID: PlayerID = '';

  public _readyPlayerIDs: Set<PlayerID> = new Set();

  private _readyStatus: Record<PlayerID, boolean> = {};

  public postColorChangeStatus = false;

  /**
   * Returns the hand of the player.
   */
  public getHand(): DeckOfCards | undefined {
    return this._playerHands;
  }

  /**
   * Retrieves the hand of the current player.
   */
  public getCurrentCard(): Card | undefined {
    return this._currentCard[this._currentCard.length - 1];
  }

  /**
   * Checks if the game is currently active.
   */
  public isActive(): boolean {
    return this._model.game?.state.status === 'IN_PROGRESS';
  }


  /**
   * Marks a player as ready for the game.
   * @param {PlayerID} playerID - The ID of the player to mark as ready.
   */

  public markPlayerReady(playerID: PlayerID): void {
    this._readyPlayerIDs.add(playerID);
    this.updateAndEmitReadyPlayers();
  }

  /**
   * Retrieves the list of player IDs who are ready.
   * @returns {PlayerID[]} An array of player IDs who are currently marked as ready.
   */
  public getReadyPlayerIDs(): PlayerID[] {
    return Array.from(this._readyPlayerIDs);
  }

  /**
   * Emits an event to update the list of ready players.
   * This should be called whenever there's a change in the readiness status of players.
   */
  public updateAndEmitReadyPlayers(): void {
    this.emit('readyPlayersListUpdated', this.getReadyPlayerIDs());
  }

  /**
   * Retrieves the hands of all players.
   * @returns {PlayerHands2DArray | undefined} A two-dimensional array representing the hands of each player.
   */
  get playersHands(): PlayerHands2DArray | undefined {
    return this._model.game?.state.playersHands;
  }

  /**
   * Gets the list of Uno player controllers.
   */
  get UnoPlayers(): PlayerController[] {
    if (this._model.game?.state)
      return this.occupants.filter(occupant =>
        this._model.game?.state.players.some(playerid => playerid === occupant.id),
      );
    else return [];
  }

  /**
   * Retrieves the most recent move made in the game.
   */
  get mostRecentMove(): UnoMove | undefined {
    return this._model.game?.state.mostRecentMove;
  }

  /**
   * Determines the current player whose turn it is to make a move.
   */
  get currentMovePlayer(): PlayerController | undefined {
    return this.UnoPlayers.find(player => player.id === this._model.game?.state.currentMovePlayer);
  }

  /**
   * Determines the amount of moves that have been played in the game.
   */
  get numberOfMovesSoFar(): number {
    return this._model.game?.state.numberOfMovesSoFar || 0;
  }

  /**
   * Determines the current color of the game to make sure only the correct color cards are played.
   */
  get currentColor(): Color | undefined {
    return this._model.game?.state.currentColor;
  }

  /**
   * Checks if it's currently our player's turn.
   */
  get isOurTurn(): boolean {
    return this.whoseTurn?.id === this._townController.ourPlayer.id || false;
  }

  /**
   * Retrieves the value of the current card in play.
   */
  get currentCardValue(): Value | undefined {
    return this._model.game?.state.currentCardValue;
  }

  /**
   * Gets the current direction of the game (e.g., clockwise, counter-clockwise).
   */
  get direction(): string | undefined {
    return this._model.game?.state.direction;
  }

  /**
   * Gets the current game status.
   */
  get status(): GameStatus {
    const status = this._model.game?.state.status;
    if (!status) {
      return 'WAITING_TO_START';
    }
    return status;
  }

  /**
   * Checks if everyone is ready for the game to begin.
   */
  get EveryOneReady(): boolean {
    return this._model.game?.state.status === 'IN_PROGRESS';
  }

  /**
   * Gets the number of cards in the current player's hand.
   */
  get numberOfCardsInPlayerHand(): number | undefined {
    const index = this._players.findIndex(p => p.id === this._townController.ourPlayer.id);
    return this._model.game?.state.playersHands[index].length;
  }

  /**
   * Retrieves the cards in our player's hand.
   */
  get ourHand(): Card[] {
    const index = this._players.findIndex(p => p.id === this._townController.ourPlayer.id);
    const playersHands: PlayerHands2DArray = this._model.game?.state.playersHands;
    return playersHands[index];
  }

  /**
   * Gets the number of cards remaining in the deck.
   */
  get numberOfCardInDeck(): number {
    return this._deck.length;
  }

  /**
   * Returns true if the current player is a player in this game
   */
  get isPlayer(): boolean {
    return this._model.game?.players.includes(this._townController.ourPlayer.id) || false;
  }

  /**
   * Identifies which player's turn it is currently.
   */
  get whoseTurn(): PlayerController | undefined {
    return (
      this.occupants.find(
        eachOccupant => eachOccupant.id === this._model.game?.state.currentMovePlayer,
      ) || undefined
    );
  }

  /**
   * Gets the image source URL for the current card.
   */
  get currentImageSrc(): string {
    return this.getImageSrc(this.currentColor || 'None', this.currentCardValue || 'None');
  }

  /**
   * Generates the image source URL for a given card based on its color and value.
   * @param {Color} color - The color of the card.
   * @param {Value} value - The value of the card.
   * @returns {string} The image source URL for the specified card.
   */
  getImageSrc(color: Color, value: Value): string {
    const lowercasedColor = color.toLowerCase();
    switch (value) {
      case 'None':
        return CARD_BACK_IMAGE;

      case 'Draw Two':
        return `${BASE_PATH}/${lowercasedColor}_picker.png`;

      case 'Reverse':
        return `${BASE_PATH}/${lowercasedColor}_reverse.png`;

      case 'Skip':
        return `${BASE_PATH}/${lowercasedColor}_skip.png`;

      case 'Wild':
        return `${BASE_PATH}/wild_color_changer.png`;

      case 'Wild Draw Four':
        return `${BASE_PATH}/wild_pick_four.png`;

      default:
        return `${BASE_PATH}/${lowercasedColor}_${value}.png`;
    }
  }

  /**
   * Updates the game state based on the current state and the action taken by a player.
   */
  protected _updateFrom(newModel: GameArea<UnoGameState>): void {
    super._updateFrom(newModel);
  }

  /**
   * Retrieves the winner of the game, if any.
   */
  get winner(): PlayerController | undefined {
    const winner = this._model.game?.state.winner;
    if (winner) {
      return this.occupants.find(eachOccupant => eachOccupant.id === winner);
    }
    return undefined;
  }

  /**
   * Toggles the ready status of the current player for the game.
   * This method changes the player's readiness state (ready/not ready) and updates the game's state accordingly.
   * It sends a 'ReadyUp' command to the server and updates the internal list of ready players based on the response.
   * The method also emits relevant events to notify other components or players about the change in readiness status.
   * - If the player is currently not ready, this method will mark them as ready.
   * - If the player is already marked as ready, it will change their status to not ready.
   */
  public async readyUp() {
    const newReadyStatus = !READY_STATUS;
    const { gameID } = await this._townController.sendInteractableCommand(this.id, {
      type: 'ReadyUp',
    });
    this._instanceID = gameID;
    const playerID = this._townController.ourPlayer.id;
    if (newReadyStatus) {
      this._readyPlayerIDs.add(playerID);
    } else {
      this._readyPlayerIDs.delete(playerID);
    }
    this.emit('readyStatusChanged', this._readyPlayerIDs);
    this.emit('playerReady', playerID);
    this.updateAndEmitReadyPlayers();
  }

  /**
   * Changes the color based on the player's choice.
   * This is typically used when a Wild or Draw 4 card is played.
   */
  public async changeColor(color: Color) {
    const { gameID } = await this._townController.sendInteractableCommand(this.id, {
      type: 'ChangeColor',
      color: color,
    });
    this._instanceID = gameID;
    this.colorChange = false;
    this.postColorChangeStatus = true;
    this.justPlayedPlayerID = "";
  }

  /**
   * Sends a request to the server to either play a card or draw a card.
   * @param {UnoMove} action - The action to be performed.
   * @returns {Promise<void>} A promise that resolves once the action is completed.
   */
  public async makeMove(action: UnoMove): Promise<void> {
    const instanceID = this._instanceID;
    if (instanceID) {
      if (action.cardPlaced.value === 'Wild' || action.cardPlaced.value === 'Wild Draw Four') {
        this.colorChange = true;
        this.justPlayedPlayerID = this._townController.ourPlayer.id;
      }
      await this._townController.sendInteractableCommand(this.id, {
        type: 'GameMove',
        gameID: instanceID,
        move: action,
      });
    this.postColorChangeStatus = false
    }
  }
  
  /**
   * Draws a card from the deck.
   * This method is called when a player decides to draw a card from the deck.
   */
  public async drawCard() {
    const { gameID } = await this._townController.sendInteractableCommand(this.id, {
      type: 'DrawFromDeck',
    });
    this._instanceID = gameID;
  }

  /**
   * Deals cards to all players.
   * This method is typically called at the start of the game to distribute cards to players.
   */
  public async dealCards() {
    const { gameID } = await this._townController.sendInteractableCommand(this.id, {
      type: 'DealCards',
    });
    this._instanceID = gameID;
  }
}
