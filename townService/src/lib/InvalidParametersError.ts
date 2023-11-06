export const PLAYER_NOT_IN_GAME_MESSAGE = 'Player is not in this game';
export default class InvalidParametersError extends Error {
  public message: string;

  public constructor(message: string) {
    super(message);
    this.message = message;
  }
}
