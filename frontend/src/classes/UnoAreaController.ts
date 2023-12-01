import _ from 'lodash';
import {
  GameArea,
  GameStatus,
  UnoGameState,
  Card,
  DeckOfCards,
  Color,
  Value,
  UnoMove
} from '../types/CoveyTownSocket';
import Game from '../../../townService/src/town/games/Game'
import PlayerController from './PlayerController';
import GameAreaController, { GameEventTypes } from './GameAreaController';
import TownController from './TownController';
import UnoPlayer from '../../../townService/src/lib/UnoPlayer';



export const PLAYER_NOT_IN_UNO_GAME_ERROR = 'Player is not in Uno game';
export const NO_UNO_GAME_IN_PROGRESS_ERROR = 'No Uno game in progress';
export const INVALID_CARD_PLAYED_ERROR = "Card can not be played";
export const NO_GAME_IN_PROGRESS_ERROR = 'No game in progress';
const noCard: Card = {
  color: "None",
  value: "None"
};


export type UnoEvents = GameEventTypes & {
  deckChanged: (deck: DeckOfCards) => void;
  turnChanged: () => void;
  colorChanged: (color: Color) => void;
  valueChanged: (value: Value) => void;
  drawFourPlaced: () => void;
  skippedPlaces: () => void;
};

// May have to change the players in the app that UnoArea.tsx
export default class UnoAreaController extends GameAreaController<UnoGameState, UnoEvents> {
  private _deck: DeckOfCards = []; 
  private _currentCard: DeckOfCards = [];
  private _playerHands: DeckOfCards = [];
  private _playersHands:Map<String,DeckOfCards> = new Map();


  /**
   * Returns the hand of the player.
   */
public getHand(): DeckOfCards | undefined {
    return this._playerHands;
  }

  /**
   * Returns the current card in play.
   */
public getCurrentCard(): Card {
    return this._currentCard[this._currentCard.length -1];
  }

public isActive(): boolean {
    return this._model.game?.state.status === 'IN_PROGRESS';
  }
get status(): GameStatus {
  const status = this._model.game?.state.status;
  if(!status){
    return 'WAITING_TO_START';
  }
  return status;
}
get EveryOneReady(): boolean {
  return this._model.game?.state.status === "IN_PROGRESS";
}

get numberOfCardsInPlayerHand() : number | undefined {
  return this._playersHands.get(this._townController.ourPlayer.id)?.length;
}

get numberOfCardInDeck() : number {
  return this._deck.length;
}

public whoseTurn() : PlayerController | undefined {
  return this.occupants.find(eachOccupant => eachOccupant.id === this._model.game?.state.currentMovePlayer.id);
}

public _getNextPlayer(): PlayerController | null {
  // Check if there are any occupants
  if (this.occupants.length === 0) {
    return null; // Return null if there are no occupants
  }

  // Assuming we maintain a state to track the current player's index
  this._currentPlayerIndex = (this._currentPlayerIndex + 1) % this._occupants.length;

  // Return the next player in the list
  return this._occupants[this._currentPlayerIndex];
}

private playCard(player: PlayerController, card: Card): void {
  const playerHand = this._playerHands
  if (!playerHand) {
    throw new Error("Player hand not found in the game");
  }

  const updatedHand = playerHand.filter(aCard => aCard !== card);
  if (playerHand.length === updatedHand.length) {
    throw new Error("Card not found in player's hand");
  }

  this._playersHands.set(this._townController.ourPlayer.id, updatedHand);
  this._currentCard.push(card);
}


private drawCard(player: PlayerController): void {
  // Draw a card from the deck
  const drawnCard = this._deck.pop();
  if (!drawnCard) {
    // If the deck is empty, reshuffle the discard pile into the deck
    this.reshuffleDeck();
    // drawnCard = this._deck.pop();
  }

  if (!drawnCard) {
    throw new Error("No cards left to draw");
  }

  // Add the card to the player's hand
  const playerHand = this._playerHands;
  if (playerHand) {
    playerHand.push(drawnCard);
  } else {
    throw new Error("Player hand not found");
  }
}

private isValidPlay(card: Card): boolean {
  return this._deck[this._deck.length-1].color == card.color || this._deck[this._deck.length-1].value == card.value;
}

private applyCardEffects(card: Card): void {
  switch(card.value){
    case 'Draw Two':
      break;
    case 'Skip':
      break;
    case 'Wild Draw Four':
      break;
    case 'Reverse':
      break;
    case 'Wild':
      break;
    default:
      throw new Error(`Unknown action type: ${card.value}`);
  }
}

private reshuffleDeck(): void {
  // Logic to reshuffle the discard pile back into the deck
}

  

  /**
   * Updates the game state based on the current state and the action taken by a player.
   */
protected _updateFrom( newModel: GameArea<UnoGameState>): void {
    const wasOurTurn: boolean = this.whoseTurn()?.id === this._townController.ourPlayer.id;
    super._updateFrom(newModel);
    const newState = newModel.game;
    if(newState){
      //UPDATE DECKOFCARDS PLAYERHANDS CURRENT CARD TURN
      const newDeck : DeckOfCards = [];
      const newPlayerHands : DeckOfCards = [];
      if(newState.state.mostRecentMove?.cardPlaced.value === 'Skip')
      {
        this.emit("skippedPlaces")
      }
      if (newState.state.currentCardValue != this.getCurrentCard()?.value && newState.state.currentColor != this.getCurrentCard()?.color){
        this.emit("topCardChanged",this.getCurrentCard());
      } else if(newState.state.currentCardValue != this.getCurrentCard()?.value){
        this.emit("valueChanged",this.getCurrentCard().value);
      } else if(newState.state.currentColor != this.getCurrentCard().color){
        this.emit("colorChanged",this.getCurrentCard().color)
      }
      /*
      protected _updateFrom(newModel: GameArea<UnoGameState>): void {
  const wasOurTurn: boolean = this.whoseTurn()?.id === this._townController.ourPlayer.id;
  super._updateFrom(newModel);
  const newState = newModel.game;
  if (newState) {
    // Extract the new state information that is relevant for Uno
    const newDeck: DeckOfCards = newState.state.deck;
    const newPlayerHands: Map<String, DeckOfCards> = new Map(newState.state.playerHands);
    const newCurrentCard: Card = { color: newState.state.currentColor, value: newState.state.currentCardValue}
    const currentPlayerID: string = newState.state.currentMovePlayer.id;
    const newTurn: boolean = currentPlayerID === this._townController.ourPlayer.id;

    // Update deck and emit event if it has changed
    if (!_.isEqual(newDeck, this._deck)) {
      this._deck = newDeck;
      this.emit('deckChanged', this._deck);
    }

    // Update player hands and emit event if they have changed
    if (!_.isEqual(newPlayerHands, this._playersHands)) {
      this._playersHands = newPlayerHands;
      // You might need an additional event for player hand changes if necessary
    }

    // Update current card and emit event if it has changed
    if (!_.isEqual(newCurrentCard, this.getCurrentCard())) {
      this._currentCard = [newCurrentCard]; // Assuming current card is the last card in the array
      this.emit('colorChanged', newCurrentCard.color);
      this.emit('valueChanged', newCurrentCard.value);
    }

    // Emit turn changed event if the turn has changed
    if (wasOurTurn !== newTurn) {
      this.emit('turnChanged');
    }
  }
}

      */

      /// deck

      this.emit("turnChanged");
    }
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
public async makeMove( action: UnoMove) {
  const instanceID = this._instanceID;
  if (!instanceID || this._model.game?.state.status !== 'IN_PROGRESS') {
    throw new Error(NO_GAME_IN_PROGRESS_ERROR);
  }
  await this._townController.sendInteractableCommand(this.id,
    {
      type: 'GameMove',
      gameID: instanceID,
      move : action
    })
    
}

  // Additional methods can be added here for more complex game logic,
  // such as dealing cards, handling special cards, etc.
private endGame(player: PlayerController) : void {
    console.log(`The player ${player.userName} win!`);
}


}

