/*
To avoid ripping-off the bandaid and switching to a proper multi-module workspace setup
we are sharing type definitions only, using tsconfig.json "references" to the shared project.
We still want to prevent relative package imports otherwise using ESLint, because importing anything
besides type declarations could become problematic from a compilation perspective.
*/

import { BroadcastOperator, Socket } from 'socket.io';
/* eslint-disable import/no-relative-packages */
import { ClientToServerEvents, ServerToClientEvents } from '../../../shared/types/CoveyTownSocket';
/* eslint-disable import/no-relative-packages */
export * from '../../../shared/types/CoveyTownSocket';

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

export interface GameResult {
    gameID: GameInstanceID;
    scores: { [playerName: string]: number };
}

export type GameStatus = 'IN_PROGRESS' | 'WAITING_TO_START' | 'OVER';

export interface GameState {
    status: GameStatus;
}

export interface WinnableGameState extends GameState {
    winner?: PlayerID;
}
export interface GameArea<T extends GameState> extends Interactable {
    game: GameInstance<T> | undefined;
    history: GameResult[];
}

export type InteractableType = 'ConversationArea' | 'ViewingArea' | 'UnoArea';
export interface Interactable {
    type: InteractableType;
    id: InteractableID;
    occupants: PlayerID[];
}

export interface UnoGameState extends WinnableGameState {
    mostRecentMove: UnoMove | null;
    currentPlayerMove: PlayerId;
  }
export interface UnoMove {
    cardToPlace: Card;
}

export type SocketData = Record<string, never>;
export type CoveyTownSocket = Socket<ClientToServerEvents, ServerToClientEvents>;
export type TownEmitter = BroadcastOperator<ServerToClientEvents, SocketData>;
export type TownEmitterFactory = (townID: string) => TownEmitter;
