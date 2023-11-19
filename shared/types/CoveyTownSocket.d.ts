export type TownJoinResponse = {
  /** Unique ID that represents this player * */
  userID: string;
  /** Secret token that this player should use to authenticate
   * in future requests to this service * */
  sessionToken: string;
  /** Secret token that this player should use to authenticate
   * in future requests to the video service * */
  providerVideoToken: string;
  /** List of players currently in this town * */
  currentPlayers: Player[];
  /** Friendly name of this town * */
  friendlyName: string;
  /** Is this a private town? * */
  isPubliclyListed: boolean;
  /** Current state of interactables in this town */
  interactables: Interactable[];
}

export type PlayerID = string;
export interface Player {
  id: PlayerID;
  userName: string;
  location: PlayerLocation;
};
export type GameInstanceID = string;

export interface GameInstance<T extends GameState> {
    state: T;
    id: GameInstanceID;
    players: PlayerID[];
    result?: GameResult;
}

export interface GameMove<MoveType> {
  playerID: PlayerID;
  gameID: GameInstanceID;
  move: MoveType;
}

export interface UnoMove {
    cardPlaced: Card;
}

export interface GameResult {
    gameID: GameInstanceID;
    scores: { [playerName: string]: number };
}

export type GameStatus = 'IN_PROGRESS' | 'WAITING_TO_START' | 'OVER';

export type Interactable = ConversationArea | ViewingArea | UnoArea;

export interface GameState{
  status: GameStatus;
}

export interface UnoGameState extends GameState{
  winner?: PlayerID;
  mostRecentMove?: UnoMove;
  currentMovePlayer?: UnoPlayer;
  currentColor: Color;
  numberOfMovesSoFar: number;
  currentCardValue: Value;
  direction: UnoGameDirection;
}

export type UnoGameDirection = 'Clockwise' | 'Counter_Clockwise'

export type TownSettingsUpdate = {
  friendlyName?: string;
  isPubliclyListed?: boolean;
}

export type Color = 'Red' | 'Green' | 'Blue' | 'Yellow' | 'Wild' | 'None';

export type Value =
  | '0'
  | '1'
  | '2'
  | '3'
  | '4'
  | '5'
  | '6'
  | '7'
  | '8'
  | '9'
  | 'Skip'
  | 'Reverse'
  | 'Draw Two'
  | 'Wild'
  | 'Wild Draw Four'
  | 'None';


export interface Card {
  color: Color;
  value: Value;
}

export type DeckOfCards = Card[];

export type Direction = 'front' | 'back' | 'left' | 'right';

export type XY = { x: number, y: number };

export interface PlayerLocation {
  /* The CENTER x coordinate of this player's location */
  x: number;
  /* The CENTER y coordinate of this player's location */
  y: number;
  /** @enum {string} */
  rotation: Direction;
  moving: boolean;
  interactableID?: string;
};
export type ChatMessage = {
  author: string;
  sid: string;
  body: string;
  dateCreated: Date;
};
export interface GameArea<T extends GameState> extends Interactable {
  game: GameInstance<T> | undefined;
  history: GameResult[];
}
export interface ConversationArea {
  id: string;
  topic?: string;
  occupantsByID: string[];
};
export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
};

export interface ViewingArea {
  id: string;
  video?: string;
  isPlaying: boolean;
  elapsedTimeSec: number;
}

export type InteractableCommand =  
  ViewingAreaUpdateCommand | 
  ReadyUpCommand | 
  ChangeColorCommand | 
  JoinGameCommand | 
  GameMoveCommand<UnoMove> | 
  LeaveGameCommand |
  DrawFromDeck;

export type InteractableCommandReturnType<CommandType extends InteractableCommand> = 
  CommandType extends JoinGameCommand ? { gameID: string}:
  CommandType extends ViewingAreaUpdateCommand ? undefined :
  CommandType extends DrawFromDeck ? undefined :
  CommandType extends ChangeColorCommand ? undefined :
  CommandType extends ReadyUpCommand ? undefined :
  CommandType extends GameMoveCommand<TicTacToeMove> ? undefined :
  CommandType extends LeaveGameCommand ? undefined :
  never;

  export interface JoinGameCommand {
    type: 'JoinGame';
  }
  export interface ViewingAreaUpdateCommand  {
    type: 'ViewingAreaUpdate';
    update: ViewingArea;
  }
  export interface ChangeColorCommand  {
    type: 'ChangeColor';
    color: Color;
  }
  export interface ReadyUpCommand  {
    type: 'ReadyUp';
  }
  export interface LeaveGameCommand {
    type: 'LeaveGame';
    gameID: GameInstanceID;
  }
  export interface GameMoveCommand<MoveType> {
    type: 'GameMove';
    gameID: GameInstanceID;
    move: MoveType;
  }
  export interface DrawFromDeck {
    type: 'DrawFromDeck';
  }
export interface ServerToClientEvents {
  playerMoved: (movedPlayer: Player) => void;
  playerDisconnect: (disconnectedPlayer: Player) => void;
  playerJoined: (newPlayer: Player) => void;
  initialize: (initialData: TownJoinResponse) => void;
  townSettingsUpdated: (update: TownSettingsUpdate) => void;
  townClosing: () => void;
  chatMessage: (message: ChatMessage) => void;
  interactableUpdate: (interactable: Interactable) => void;
}

export interface ClientToServerEvents {
  chatMessage: (message: ChatMessage) => void;
  playerMovement: (movementData: PlayerLocation) => void;
  interactableUpdate: (update: Interactable) => void;
}

