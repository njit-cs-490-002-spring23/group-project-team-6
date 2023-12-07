import InvalidParametersError, {
    GAME_ID_MISSMATCH_MESSAGE,
    GAME_NOT_IN_PROGRESS_MESSAGE,
    INVALID_COMMAND_MESSAGE,
  } from '../../lib/InvalidParametersError';
import Player from '../../lib/Player';
import UnoPlayer from '../../lib/UnoPlayer';
  import {
    GameInstance,
    InteractableCommand,
    InteractableCommandReturnType,
    InteractableType,
    UnoGameState,
  } from '../../types/CoveyTownSocket';
  import GameArea from './GameArea';
  import UnoGame from './UnoGame';

  /**
 * An UnoArea is a GameArea that hosts an UnoGame.
 * @see UnoGame
 * @see GameArea
 */
export default class UnoArea extends GameArea<UnoGame> {
  // eslint-disable-next-line class-methods-use-this
  protected getType(): InteractableType {
    return 'UnoArea';
  }

  private _stateUpdated(updatedState: GameInstance<UnoGameState>) {
    console.log("this._stateUpdated called");
    if (updatedState.state.status === 'OVER') {
      const game = this._game;
      if (game === undefined)
        throw new InvalidParametersError(GAME_NOT_IN_PROGRESS_MESSAGE);
      const gameID = game.id;
      const scores: { [playerName: string]: number } = {};
      const winnerID = game.state.winner;
      game._players.forEach((player) => {
        if ( player.id !== winnerID ){
          scores[player.userName] = 0;
        }
        else {
          scores[player.userName] = 1;
        }
      });
      this._history.push({
          gameID, 
          scores
        });
    }
    this._emitAreaChanged();
    console.log("this._emitAreaChanged(); returned");
  }


  /**
   * Handle a command from a player in this game area.
   * Supported commands:
   * - JoinGame (joins the game `this._game`, or creates a new one if none is in progress)
   * - GameMove (applies a move to the game)
   * - LeaveGame (leaves the game)
   *
   * If the command ended the game, records the outcome in this._history
   * If the command is successful (does not throw an error), calls this._emitAreaChanged (necessary
   *  to notify any listeners of a state update, including any change to history)
   * If the command is unsuccessful (throws an error), the error is propagated to the caller
   *
   * @see InteractableCommand
   *
   * @param command command to handle
   * @param player player making the request
   * @returns response to the command, @see InteractableCommandResponse
   * @throws InvalidParametersError if the command is not supported or is invalid. Invalid commands:
   *  - LeaveGame and GameMove: No game in progress (GAME_NOT_IN_PROGRESS_MESSAGE),
   *        or gameID does not match the game in progress (GAME_ID_MISSMATCH_MESSAGE)
   *  - Any command besides LeaveGame, GameMove and JoinGame: INVALID_COMMAND_MESSAGE
   */
  public handleCommand<CommandType extends InteractableCommand>(
    command: CommandType,
    player: Player,
  ): InteractableCommandReturnType<CommandType> {
    if (command.type === 'GameMove') {
      const game = this._game;
      if (!game) {
        throw new InvalidParametersError(GAME_NOT_IN_PROGRESS_MESSAGE);
      }
      if (this._game?.id !== command.gameID) {
        throw new InvalidParametersError(GAME_ID_MISSMATCH_MESSAGE);
      }
      // const currentUnoPlayer: UnoPlayer | undefined = game._players.find(unoPlayer => unoPlayer.id === player.id);
      game.applyMove({
        gameID: command.gameID,
        playerID: player.id,
        move: command.move,
      });
      this._stateUpdated(game.toModel());
      return undefined as InteractableCommandReturnType<CommandType>;
    }
    if (command.type === 'JoinGame') {
      let game = this._game;
      if (!game || game.state.status === 'OVER') {
        // No game in progress, make a new one
        game = new UnoGame();
        this._game = game;
      }
      game.join(player);
      this._stateUpdated(game.toModel());
      return { gameID: game.id } as InteractableCommandReturnType<CommandType>;
    }
    if (command.type === 'LeaveGame') {
      const game = this._game;
      if (!game) {
        throw new InvalidParametersError(GAME_NOT_IN_PROGRESS_MESSAGE);
      }
      if (this._game?.id !== command.gameID) {
        throw new InvalidParametersError(GAME_ID_MISSMATCH_MESSAGE);
      }
      game.leave(player);
      this._stateUpdated(game.toModel());
      return { gameID: game.id } as InteractableCommandReturnType<CommandType>;
    }
    if (command.type === 'ChangeColor') {
      const game = this._game;
      if (!game) {
        throw new InvalidParametersError(GAME_NOT_IN_PROGRESS_MESSAGE);
      }
      game.updateColor(command.color);
      this._stateUpdated(game.toModel());
      return { gameID: game.id } as InteractableCommandReturnType<CommandType>;
    }
    if (command.type === 'ReadyUp') {
      const game = this._game;
      if (!game) {
        throw new InvalidParametersError(GAME_NOT_IN_PROGRESS_MESSAGE);
      }
      const currentUnoPlayer: UnoPlayer | undefined = game._unoPlayers.find(unoPlayer => unoPlayer.id === player.id);
      if (currentUnoPlayer === undefined){
        throw new InvalidParametersError(INVALID_COMMAND_MESSAGE);
      }
      game.playerReadyUp(currentUnoPlayer);
      this._stateUpdated(game.toModel());
      return { gameID: game.id } as InteractableCommandReturnType<CommandType>;
    }
    if (command.type === 'DrawFromDeck'){
      const game = this._game;
      if (!game) {
        throw new InvalidParametersError(GAME_NOT_IN_PROGRESS_MESSAGE);
      }
      const currentUnoPlayer: UnoPlayer | undefined = game._unoPlayers.find(unoPlayer => unoPlayer.id === player.id);
      if (currentUnoPlayer === undefined){
        throw new InvalidParametersError(INVALID_COMMAND_MESSAGE);
      }
      game.drawFromDeck(currentUnoPlayer);
      this._stateUpdated(game.toModel());
      return { gameID: game.id } as InteractableCommandReturnType<CommandType>;
    }
    if (command.type === 'DealCards'){
      const game = this._game;
      if (!game) {
        throw new InvalidParametersError(GAME_NOT_IN_PROGRESS_MESSAGE);
      }
      console.log("game.shuffleAndDealCards(); Calling now");
      game.shuffleAndDealCards();
      console.log("game.shuffleAndDealCards(); returned");
      this._stateUpdated(game.toModel());
      console.log("this._stateUpdated(game.toModel()); returned");
      return { gameID: game.id } as InteractableCommandReturnType<CommandType>;
    }
    
  throw new InvalidParametersError(INVALID_COMMAND_MESSAGE);
  }
}