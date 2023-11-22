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
  private _currentCard: DeckOfCards = [];
  // private _playerHands: Map<String, DeckOfCards> = new Map(); 
  private _playerHands: DeckOfCards = [];
  private playID = this._model.game?.state.currentMovePlayer.id;
  private _playersHands:Map<PlayerController,DeckOfCards> = new Map();


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
  return this._playerHands.get(this.playID)?.length;
}

get numberOfCardInDeck() : number {
  return this._deck.length;
}

// public handlePlayerAction(player: PlayerController, action: UnoMove): void {
//     let ArraySpecialCards : Value[] = ["Draw Two","Reverse","Skip","Wild Draw Four",'Wild']
//     if (!this.isActive()) {
//       throw new Error(NO_UNO_GAME_IN_PROGRESS_ERROR);
//     }
  
//     if (!this._playerHands.has(this.playID)) {
//       throw new Error(PLAYER_NOT_IN_UNO_GAME_ERROR);
//     }
//     const CardPlaced: Card =  action.cardPlaced;
//     if(!this.isValidPlay(CardPlaced))
//     {
//       throw new Error(INVALID_CARD_PLAYED_ERROR);
//     }
//     if(!ArraySpecialCards.includes(CardPlaced.value))
//     {
//       this.playCard(player,CardPlaced);

//     } else {
//       this.applyCardEffects(CardPlaced);
     
//     }
//     const playerHand : DeckOfCards = this._playerHands.get(this.playID) || [];
//     if (playerHand.length === 0) {
//       this.endGame(player);
//     }
  
//     // Move to the next player
//     this.nextPlayer();
//   }

  public whoseTurn() : PlayerController | undefined {
    return this.occupants.find(eachOccupant => eachOccupant.id === this._model.game?.state.currentMovePlayer.id);
  }
  public _getNextPlayer(): PlayerController {

  }
private playCard(player: PlayerController, card: Card): void {
  const playerHand = this._playerHands.get(this.playID);
  if (!playerHand) {
    throw new Error("Player hand not found in the game");
  }

  const updatedHand = playerHand.filter(aCard => aCard !== card);
  if (playerHand.length === updatedHand.length) {
    throw new Error("Card not found in player's hand");
  }

  this._playerHands.set(this.playID, updatedHand);
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
  const playerHand = this._playerHands.get(this.playID);
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
      const newTopCard : Card = noCard;
      newState.state.
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
public async makeMove(player:PlayerController, action: UnoMove): Promise<void> {
  const instanceID = this._instanceID;
  if (!instanceID || this._model.game?.state.status !== 'IN_PROGRESS') {
    throw new Error(NO_GAME_IN_PROGRESS_ERROR);
  }
  await this._townController.send
    
}

  // Additional methods can be added here for more complex game logic,
  // such as dealing cards, handling special cards, etc.
private endGame(player: PlayerController) : void {
    console.log(`The player ${player.userName} win!`);
}


}

