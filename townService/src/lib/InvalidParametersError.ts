export const PLAYER_NOT_IN_GAME_MESSAGE = 'Player is not in this game';
export const PLAYER_ALREADY_IN_GAME_MESSAGE = 'Player is already in this game';
export const GAME_FULL_MESSAGE = 'Game is full';
export const GAME_NOT_IN_PROGRESS_MESSAGE = 'Game as either ended or nto started yet';
export const INVALID_MOVE_MESSAGE = 'Invalid Card! Use the right color or value as seen.';
export const NOT_YOUR_TURN_MESSAGE = 'Not your turn!';
export const GAME_ID_MISSMATCH_MESSAGE = 'ID Mismatch Error';
export const INVALID_COMMAND_MESSAGE = 'Invalid Command';

export default class InvalidParametersError extends Error {
  public message: string;

  public constructor(message: string) {
    super(message);
    this.message = message;
  }
}
