import { nanoid } from 'nanoid';
import {
  GameInstance,
  GameInstanceID,
  GameMove,
  GameResult,
  GameState,
} from '../../types/CoveyTownSocket';
import UnoPlayer from '../../lib/UnoPlayer';
/**
 * This class is the base class for all games. It is responsible for managing the
 * state of the game. @see GameArea
 */
export default abstract class Game<StateType extends GameState, MoveType> {
  private _state: StateType;

  public readonly id: GameInstanceID;

  public _players: UnoPlayer[] = [];

  protected _result?: GameResult;

  /**
   * Creates a new Game instance.
   * @param initialState State to initialize the game with.
   * @param emitAreaChanged A callback to invoke when the state of the game changes. This is used to notify clients.
   */
  public constructor(initialState: StateType) {
    this.id = nanoid() as GameInstanceID;
    this._state = initialState;
  }

  public get state() {
    return this._state;
  }

  protected set state(newState: StateType) {
    this._state = newState;
  }
  /**
   * Mark player as ready to play.
   * This method should be implemented by subclasses.
   * @param player The player to join the game.
   */

  public abstract playerReadyUp(player: UnoPlayer): void;

  /**
   * Apply a move to the game.
   * This method should be implemented by subclasses.
   * @param move A move to apply to the game.
   * @throws InvalidParametersError if the move is invalid.
   */
  public abstract applyMove(move: GameMove<MoveType>): void;

  /**
   * Attempt to join a game.
   * This method should be implemented by subclasses.
   * @param player The player to join the game.
   * @throws InvalidParametersError if the player can not join the game
   */
  protected abstract _join(player: UnoPlayer): void;

  /**
   * Attempt to leave a game.
   * This method should be implemented by subclasses.
   * @param player The player to leave the game.
   * @throws InvalidParametersError if the player can not leave the game
   */
  protected abstract _leave(player: UnoPlayer): void;

  /**
   * Attempt to join a game.
   * Adds the player to the list of players for the game if the game allows the player to join.
   * @param player The player to join the game.
   * @throws InvalidParametersError if the player can not join the game
   */
  public join(player: UnoPlayer): void {
    this._join(player);
  }

  /**
   * Attempt to leave a game.
   * Removes the player from the list of players for the game if the game allows the player to leave.
   * @param player The player to leave the game.
   * @throws InvalidParametersError if the player can not leave the game
   */
  public leave(player: UnoPlayer): void {
    this._leave(player);
    this._players = this._players.filter(p => p.id !== player.id);
  }

  public toModel(): GameInstance<StateType> {
    return {
      state: this._state,
      id: this.id,
      result: this._result,
      players: this._players.map(player => player.id),
    };
  }
}
