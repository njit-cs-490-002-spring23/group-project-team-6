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
import {BASE_PATH, CARD_BACK_IMAGE} from '../components/Town/interactables/UnoTable';
import PlayerController from './PlayerController';
import GameAreaController, { GameEventTypes } from './GameAreaController';

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

  public colorChange = false;

  public justPlayedPlayerID: PlayerID = "";

  public _readyPlayerIDs: Set<PlayerID> = new Set();

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

  public markPlayerReady(playerID: PlayerID): void {
    this._readyPlayerIDs.add(playerID);
    this.updateAndEmitReadyPlayers();
  }

  public getReadyPlayerIDs(): PlayerID[] {
    return Array.from(this._readyPlayerIDs);
  }

  public updateAndEmitReadyPlayers(): void {
    this.emit('readyPlayersListUpdated', this.getReadyPlayerIDs());
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

get currentImageSrc() : string {
  return this.getImageSrc(this.currentColor || "None", this.currentCardValue || "None");
}

getImageSrc(color: Color, value: Value): string {
  const lowercasedColor = color.toLowerCase();
  switch (value) {
    case "None":
      return CARD_BACK_IMAGE;

    case "Draw Two":
      return `${BASE_PATH}/${lowercasedColor}_picker.png`;

    case "Reverse":
      return `${BASE_PATH}/${lowercasedColor}_reverse.png`;

    case "Skip":
      return `${BASE_PATH}/${lowercasedColor}_skip.png`;

    case "Wild":
      return `${BASE_PATH}/wild_color_changer.png`;

    case "Wild Draw Four":
      return `${BASE_PATH}/wild_pick_four.png`;

    default:
      return `${BASE_PATH}/${lowercasedColor}_${value}.png`;
  }
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



  /**
   * Updates the game state based on the current state and the action taken by a player.
   */
protected _updateFrom( newModel: GameArea<UnoGameState>): void {
    super._updateFrom(newModel);
  }

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
    const playerID = this._townController.ourPlayer.id;
    this._readyPlayerIDs.add(playerID);
    this.emit('playerReady', this._townController.ourPlayer.id);
    this.updateAndEmitReadyPlayers();
  }

  public async changeColor(color: Color) {
    const { gameID } = await this._townController.sendInteractableCommand(this.id, {
      type: 'ChangeColor',
      color: color,
    });
    this._instanceID = gameID;
    this.colorChange = false;
    this.justPlayedPlayerID = "";
  }



  /**
   * Sends a request to the server to play a card or draw a card
   */
public async makeMove( action: UnoMove): Promise<void> {
  const instanceID = this._instanceID;
  if (instanceID){
    if (action.cardPlaced.value === "Wild" || action.cardPlaced.value === "Wild Draw Four"){
      this.colorChange = true;
      this.justPlayedPlayerID = this._townController.ourPlayer.id;
    }
    await this._townController.sendInteractableCommand(this.id,
      {
        type: 'GameMove',
        gameID: instanceID,
        move : action,
      })
  }
}

public async drawCard() {
  const { gameID } =  await this._townController.sendInteractableCommand(this.id,
    {
      type: 'DrawFromDeck',
    })
    this._instanceID = gameID;
}


public async dealCards() {
  const { gameID } =  await this._townController.sendInteractableCommand(this.id,
    {
      type: 'DealCards',
    })
    this._instanceID = gameID;
}
}