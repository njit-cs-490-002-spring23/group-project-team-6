export const PLAYER_NOT_IN_GAME_MESSAGE = 'Player is not in this game';
export const PLAYER_ALREADY_IN_GAME_MESSAGE = 'Player is already in this game';
export const INVALID_MOVE_MESSAGE = 'Invalid Card! Use the right color or value as seen.';
export const GAME_FULL_MESSAGE = 'Game is full';
export const GAME_HASNT_STARTED_MESSAGE = 'Game has not yet started.'
export default class InvalidParametersError extends Error {
  public message: string;

  public constructor(message: string) {
    super(message);
    this.message = message;
  }
}
