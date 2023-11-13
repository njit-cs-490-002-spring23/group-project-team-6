export const PLAYER_NOT_IN_GAME_MESSAGE = 'Player is not in this game';
export const PLAYER_ALREADY_IN_GAME_MESSAGE = 'Player is already in this game';
<<<<<<< HEAD
export const INVALID_MOVE_MESSAGE = 'Invalid Card! Use the right color or value as seen.';
export const GAME_FULL_MESSAGE = 'Game is full';
export const GAME_HASNT_STARTED_MESSAGE = 'Game has not yet started.'
=======
export const GAME_FULL_MESSAGE = 'Game is full';
export const GAME_NOT_IN_PROGRESS_MESSAGE = 'Game as either ended or not started yet';
export const MOVE_NOT_YOUR_TURN_MESSAGE = 'It is not your turn';

>>>>>>> main
export default class InvalidParametersError extends Error {
  public message: string;

  public constructor(message: string) {
    super(message);
    this.message = message;
  }
}
