import _ from 'lodash';
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
  PlayerHands2DArray
} from '../types/CoveyTownSocket';
import Game from '../../../townService/src/town/games/Game'
import PlayerController from './PlayerController';
import GameAreaController, { GameEventTypes } from './GameAreaController';
import TownController from './TownController';
import UnoPlayer from '../../../townService/src/lib/UnoPlayer';
import { UnoCard } from './UnoCards';



export const PLAYER_NOT_IN_UNO_GAME_ERROR = 'Player is not in Uno game';
export const NO_UNO_GAME_IN_PROGRESS_ERROR = 'No Uno game in progress';
export const INVALID_CARD_PLAYED_ERROR = "Card can not be played";
export const NO_GAME_IN_PROGRESS_ERROR = 'No game in progress';
export const noCard: Card = {
  color: "None",
  value: "None",
  src: "",
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

  private _currentCard: DeckOfCards = [];

  private _playerHands: DeckOfCards = [];

  /**
   * Returns the hand of the player.
   */
public getHand(): DeckOfCards | undefined {
    return this._playerHands;
  }

  /**
   * Returns the current card in play.
   */
public getCurrentCard(): Card | undefined {
    return this._currentCard[this._currentCard.length -1];
  }

public isActive(): boolean {
    return this._model.game?.state.status === 'IN_PROGRESS';
  }

/*public getNextPlayer(): PlayerController {
  return this.occupants.find(eachOccupant => eachOccupant.id === this._model.game?.nextPlayerID);
}
*/

get playersHands(): PlayerHands2DArray | undefined {
  return this._model.game?.state.playersHands;
}

get UnoPlayers(): PlayerController[] {
  if (this._model.game?.state)
    return this.occupants.filter(occupant => this._model.game?.state.players.some(playerid => playerid === occupant.id));
  else
    return [];
}

get mostRecentMove(): UnoMove | undefined {
  return this._model.game?.state.mostRecentMove;
}

get currentMovePlayer(): PlayerController | undefined {
  return this.UnoPlayers.find(player => player.id === this._model.game?.state.currentMovePlayer);
}

get numberOfMovesSoFar(): number {
  return this._model.game?.state.numberOfMovesSoFar || 0;
}

get currentColor(): Color | undefined {
  return this._model.game?.state.currentColor;
}

get isOurTurn(): boolean {
  return this.whoseTurn?.id === this._townController.ourPlayer.id || false;
}

get currentCardValue(): Value | undefined {
  return this._model.game?.state.currentCardValue;
}

get direction(): string | undefined {
  return this._model.game?.state.direction;
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
  const index = this._players.findIndex((p) => p.id === this._townController.ourPlayer.id);
  return this._model.game?.state.playersHands[index].length;
}

get ourHand(): Card[] { 
  const index = this._players.findIndex((p) => p.id === this._townController.ourPlayer.id);
  const playersHands: PlayerHands2DArray = this._model.game?.state.playersHands;
  return playersHands[index];
}

get numberOfCardInDeck() : number {
  return this._deck.length;
}

/**
 * Returns true if the current player is a player in this game
 */
get isPlayer(): boolean {
  return this._model.game?.players.includes(this._townController.ourPlayer.id) || false;
}


get whoseTurn() : PlayerController | undefined {
  return this.occupants.find(eachOccupant => eachOccupant.id === this._model.game?.state.currentMovePlayer) || undefined;
}

/*public _getNextPlayer(): PlayerController {
  if(this._model.game?.state.direction === 'Clockwise')
  {
    return this.occupants.find(eachOcc => eachOcc.id === this._model.game?.state.)
  }
    return this.occupants.find(eachOcc => eachOcc.id === this._model.game?.state.)
}*/

private _playCard(player: PlayerController, card: Card): void {
  const playerHand = this._playerHands
  if (!playerHand) {
    throw new Error("Player hand not found in the game");
  }

  const updatedHand = playerHand.filter(aCard => aCard !== card);
  if (playerHand.length === updatedHand.length) {
    throw new Error("Card not found in player's hand");
  }

  //this._playerHands.set(this._townController.ourPlayer.id, updatedHand);
  this._currentCard.push(card);
}


private _drawCard(player: PlayerController): void {
  // Draw a card from the deck
  const drawnCard = this._deck.pop();
  if (!drawnCard) {
    // If the deck is empty, reshuffle the discard pile into the deck
    this._reshuffleDeck();
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

private _applyCardEffects(card: Card): void {
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

private _reshuffleDeck(): void {
  // Logic to reshuffle the discard pile back into the deck
}

  

  /**
   * Updates the game state based on the current state and the action taken by a player.
   */
protected _updateFrom( newModel: GameArea<UnoGameState>): void {
    super._updateFrom(newModel);
    const newState = newModel.game;
    if(newState){
      //UPDATE DECKOFCARDS PLAYERHANDS CURRENT CARD TURN
      const newDeck : DeckOfCards = [];
      const newPlayerHands : DeckOfCards = [];
      if(newState.state.currentCardValue != this.getCurrentCard()?.value && newState.state.currentColor != this.getCurrentCard()?.color)
        this.emit("topCardChanged",this.getCurrentCard());
      /// deck

    }
  }

  /**
   * Determines if the game has ended and who the winner is.
   */
public checkForGameEnd(): void {
    // Implement the logic to determine game end and winner
  }

  /**
   * Returns the winner of the game, if there is one
   */
  get winner(): PlayerController | undefined {
    const winner = this._model.game?.state.winner;
    if (winner) {
      return this.occupants.find(eachOccupant => eachOccupant.id === winner);
    }
    return undefined;
  }

  public async readyUp() {
    const { gameID } = await this._townController.sendInteractableCommand(this.id, {
      type: 'ReadyUp',
    });
    this._instanceID = gameID;
  }

  public async dealCards() {
    const { gameID } = await this._townController.sendInteractableCommand(this.id, {
      type: 'DealCards',
    });
    this._instanceID = gameID;
  }


  /**
   * Sends a request to the server to play a card or draw a card
   */
public async makeMove( action: UnoMove): Promise<void> {
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
private _endGame(player: PlayerController) : void {
    console.log(`The player ${player.userName} win!`);
}


}