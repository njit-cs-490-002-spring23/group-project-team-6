import _ from 'lodash';
import {
  GameArea,
  GameStatus,
  UnoGameState,
  UnoPlayer,
  Card,
  DeckOfCards,
  Color,
  Value
} from '../types/CoveyTownSocket';

import PlayerController from './PlayerController';
import GameAreaController, { GameEventTypes } from './GameAreaController';

export const PLAYER_NOT_IN_UNO_GAME_ERROR = 'Player is not in Uno game';
export const NO_UNO_GAME_IN_PROGRESS_ERROR = 'No Uno game in progress';

export const noCard : Card = {
  color: "None",
  value: "None"
};

export type UnoEvents = GameEventTypes & {
  deckChanged: (deck: DeckOfCards) => void;
  turnChanged: (isOurTurn: boolean) => void;
  colorChanged: (color: Color) => void;
  valueChanged: (value: Value) => void;
  skippedPlaces: () => void;
};

export default class UnoAreaController extends GameAreaController<UnoGameState, UnoEvents> {
  private _deck: DeckOfCards = []; // Deck of Uno cards
  private _currentCard: Card | undefined; // Current card in play
  private _playerHands: Map<UnoPlayer, DeckOfCards> = new Map(); // Map of player IDs to their hands

  /**
   * Returns the hand of the specified player.
   */
  get getHand(): DeckOfCards | undefined {
    return this._playerHands[this._model.game?.players.find()];
  }

  /**
   * Returns the current card in play.
   */
  getCurrentCard(): UnoCard | undefined {
    return this._currentCard;
  }

  /**
   * Handles a player action in the Uno game.
   * @param player PlayerController of the player making the action
   * @param action The action the player is taking
   */
  handlePlayerAction(player: PlayerController, action: UnoPlayerAction) {
    // Implement the logic to handle player actions (like playing a card, drawing a card, etc.)
  }

  /**
   * Updates the game state based on the current state and the action taken by a player.
   */
  updateGameState() {
    // Implement the logic to update the game state
  }

  /**
   * Determines if the game has ended and who the winner is.
   */
  checkForGameEnd() {
    // Implement the logic to determine game end and winner
  }

  /**
   * Sends a request to the server to play a card or draw a card
   * @param action The action the player is taking
   */
  public async makeMove(action: UnoPlayerAction) {
    // Logic to send a move to the server
  }
}