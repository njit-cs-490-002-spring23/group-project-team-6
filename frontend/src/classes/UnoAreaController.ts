import _ from 'lodash';
import {
  GameArea,
  GameStatus,
  UnoGameState,
  Player,
  Card,
  DeckOfCards,
  Color,
  Value,
  UnoMove
} from '../types/CoveyTownSocket';

import PlayerController from './PlayerController';
import GameAreaController, { GameEventTypes } from './GameAreaController';

export const PLAYER_NOT_IN_UNO_GAME_ERROR = 'Player is not in Uno game';
export const NO_UNO_GAME_IN_PROGRESS_ERROR = 'No Uno game in progress';

export const noCard: Card = {
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
  private _deck: DeckOfCards = []; 
  private _currentCard: Card | undefined; 
  private _playerHands: Map<Player, DeckOfCards> = new Map(); 

  /**
   * Returns the hand of the player.
   */
  public getHand(player: Player): DeckOfCards | undefined {
    return this._playerHands.get(player);
  }

  /**
   * Returns the current card in play.
   */
  public getCurrentCard(): Card | undefined {
    return this._currentCard;
  }

  public isActive(): boolean {
    return this._model.game?.state.status === 'IN_PROGRESS';
  }

  /**
   * Handles a player action in the Uno game.
   */
  public handlePlayerAction(player: Player, action: UnoMove): void {
    if (!this.isActive()) {
      throw new Error(NO_UNO_GAME_IN_PROGRESS_ERROR);
    }
  
    if (!this._playerHands.has(player)) {
      throw new Error(PLAYER_NOT_IN_UNO_GAME_ERROR);
    }
  
    switch (action.type) {
      case 'PLAY_CARD':
        this.playCard(player, action.card);
        break;
      case 'DRAW_CARD':
        this.drawCard(player);
        break;
      // Add additional case statements for other action types if needed
      default:
        throw new Error(`Unknown action type: ${action.type}`);
    }

    private playCard(player: Player, card: Card): void {
  const playerHand = this._playerHands.get(player);
  if (!playerHand) {
    throw new Error("Player hand not found");
  }

  // Check if the card is in the player's hand
  const cardIndex = playerHand.findIndex(c => c.color === card.color && c.value === card.value);
  if (cardIndex === -1) {
    throw new Error("Card not in player's hand");
  }

  // Check if the card can be played on the current card
  if (!this.isValidPlay(card)) {
    throw new Error("Invalid card play");
  }

  // Apply the card's effects (skip, reverse, draw two, etc.)
  this.applyCardEffects(card);

  // Remove the card from the player's hand
  playerHand.splice(cardIndex, 1);

  // Update the current card
  this._currentCard = card;
}

private drawCard(player: Player): void {
  // Draw a card from the deck
  const drawnCard = this._deck.pop();
  if (!drawnCard) {
    // If the deck is empty, reshuffle the discard pile into the deck
    this.reshuffleDeck();
    drawnCard = this._deck.pop();
  }

  if (!drawnCard) {
    throw new Error("No cards left to draw");
  }

  // Add the card to the player's hand
  const playerHand = this._playerHands.get(player);
  if (playerHand) {
    playerHand.push(drawnCard);
  } else {
    throw new Error("Player hand not found");
  }
}

private isValidPlay(card: Card): boolean {
  // Logic to check if the card can be played
  // This should include checking against the current card in play, and special rules for wild cards
}

private applyCardEffects(card: Card): void {
  // Logic to apply effects of the card (skip, reverse, draw two, etc.)
  // This may include modifying the game state, such as changing turn order or forcing other players to draw cards
}

private reshuffleDeck(): void {
  // Logic to reshuffle the discard pile back into the deck
}

  
    // After handling the action, you might want to update the game state,
    // check for game end, update turn, notify other players, etc.
    this.updateGameState();
    this.checkForGameEnd();
  }

  /**
   * Updates the game state based on the current state and the action taken by a player.
   */
  public updateGameState(): void {
    // Implement the logic to update the game state
  }

  /**
   * Determines if the game has ended and who the winner is.
   */
  public checkForGameEnd(): void {
    // Implement the logic to determine game end and winner
  }

  /**
   * Sends a request to the server to play a card or draw a card
   */
  public async makeMove(action: UnoMove): Promise<void> {
    // Logic to send a move to the server
  }

  // Additional methods can be added here for more complex game logic,
  // such as dealing cards, handling special cards, etc.
}
