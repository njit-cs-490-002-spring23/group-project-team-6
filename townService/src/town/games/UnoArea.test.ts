import { mock } from 'jest-mock-extended';
import { nanoid } from 'nanoid';
import { createPlayerForTesting } from '../../TestUtils';
import {
  GAME_ID_MISSMATCH_MESSAGE,
  GAME_NOT_IN_PROGRESS_MESSAGE,
  INVALID_COMMAND_MESSAGE,
} from '../../lib/InvalidParametersError';
import Player from '../../lib/Player';
import {
  GameInstanceID,
  UnoGameState,
  UnoMove,
  TownEmitter,
} from '../../types/CoveyTownSocket';
import UnoPlayer from '../../lib/UnoPlayer';
import UnoArea from './UnoArea';
import * as UnoGameModule from './UnoGame';
import Game from './Game';

class TestingGame extends Game<UnoGameState, UnoMove> {
  public constructor() {
    super({
        mostRecentMove: undefined,
        currentMovePlayer: undefined, 
        status: 'WAITING_TO_START',
        numberOfMovesSoFar: 0,
        currentColor: 'None',
        currentCardValue: 'None',
        direction: 'Counter_Clockwise',
        playersHands: [],
        players: [],
    });
  }

  // eslint-disable-next-line class-methods-use-this
  public applyMove(): void {}

  // eslint-disable-next-line class-methods-use-this
  public drawFromDeck(): void {}

  // eslint-disable-next-line class-methods-use-this
  public updateColor(): void {}

  // eslint-disable-next-line class-methods-use-this
  public shuffleAndDealCards(): boolean {
    return true;
  }

  // eslint-disable-next-line class-methods-use-this
  public get NextPlayerID(): string {
    return "";
  }

  public endGame(winner?: string) {
    this.state = {
      ...this.state,
      status: 'OVER',
      winner,
    };
  }

  protected _join(player: UnoPlayer): void {
      this._unoPlayers.push(player);
    }

  // eslint-disable-next-line class-methods-use-this
  protected _leave(): void {}

  public playerReadyUp(player: UnoPlayer): void {
    player.readyUp = !player.readyUp;
    let allPlayersReady = true;
    for (let j = 0; j < this._players.length; j++) {
      if (!this._unoPlayers[j].readyUp){
        allPlayersReady = false;
        break;
      }
    }
    if (allPlayersReady){
      this.state.status = 'IN_PROGRESS';
    }
  }
}

describe('UnoArea', () => {
  let gameArea: UnoArea;
  let player1: Player;
  let player2: Player;
  let player3: Player;
  let player4: Player;
  let interactableUpdateSpy: jest.SpyInstance;
  let game: TestingGame;
  beforeEach(() => {
    const gameConstructorSpy = jest.spyOn(UnoGameModule, 'default');
    game = new TestingGame();
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore (Testing without using the real game class)
    gameConstructorSpy.mockReturnValue(game);

    player1 = createPlayerForTesting();
    player2 = createPlayerForTesting();
    player3 = createPlayerForTesting();
    player4 = createPlayerForTesting();
    gameArea = new UnoArea(
      nanoid(),
      { x: 0, y: 0, width: 100, height: 100 },
      mock<TownEmitter>(),
    );
    gameArea.add(player1);
    gameArea.add(player2);
    gameArea.add(player3);
    gameArea.add(player4);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore (Test requires access to protected method)
    interactableUpdateSpy = jest.spyOn(gameArea, '_emitAreaChanged');
  });
  describe('handleCommand', () => {
    describe('[T3.1] when given a JoinGame command', () => {
      describe('when there is no game in progress', () => {
        it('should create a new game and call _emitAreaChanged', () => {
          const { gameID } = gameArea.handleCommand({ type: 'JoinGame' }, player1);
          expect(gameID).toBeDefined();
          if (!game) {
            throw new Error('Game was not created by the first call to join');
          }
          expect(gameID).toEqual(game.id);
          expect(interactableUpdateSpy).toHaveBeenCalledTimes(1);
        });
      });
      describe('when there is a game waiting to start', () => {
        it('should dispatch the join command to the game and call _emitAreaChanged', () => {
          const { gameID } = gameArea.handleCommand({ type: 'JoinGame' }, player1);
          if (!game) {
            throw new Error('Game was not created by the first call to join');
          }
          expect(interactableUpdateSpy).toHaveBeenCalledTimes(1);

          const joinSpy = jest.spyOn(game, 'join');
          const gameID2 = gameArea.handleCommand({ type: 'JoinGame' }, player2).gameID;
          expect(joinSpy).toHaveBeenCalledWith(player2);
          expect(gameID).toEqual(gameID2);
          expect(interactableUpdateSpy).toHaveBeenCalledTimes(2);
        });
        it('should not call _emitAreaChanged if the game throws an error', () => {
          gameArea.handleCommand({ type: 'JoinGame' }, player1);
          if (!game) {
            throw new Error('Game was not created by the first call to join');
          }
          interactableUpdateSpy.mockClear();

          jest.spyOn(game, 'join').mockImplementationOnce(() => {
            throw new Error('Test Error');
          });
          expect(() => gameArea.handleCommand({ type: 'JoinGame' }, player2)).toThrowError(
            'Test Error',
          );
          expect(interactableUpdateSpy).not.toHaveBeenCalled();
        });
      });
    });
    describe('[T3.2] when given a GameMove command', () => {
      it('should throw an error when there is no game in progress', () => {
        expect(() =>
          gameArea.handleCommand(
            { type: 'GameMove', move: { cardPlaced: {color: "Blue", value: "0", src: ''} }, gameID: nanoid() },
            player1,
          ),
        ).toThrowError(GAME_NOT_IN_PROGRESS_MESSAGE);
      });
      describe('when there is a game in progress', () => {
        let gameID: GameInstanceID;
        beforeEach(() => {
          gameID = gameArea.handleCommand({ type: 'JoinGame' }, player1).gameID;
          gameArea.handleCommand({ type: 'JoinGame' }, player2);
          gameArea.handleCommand({ type: 'JoinGame' }, player3);
          gameArea.handleCommand({ type: 'JoinGame' }, player4);
          gameArea.handleCommand({ type: 'ReadyUp'}, player1);
          gameArea.handleCommand({ type: 'ReadyUp'}, player2);
          gameArea.handleCommand({ type: 'ReadyUp'}, player3);
          gameArea.handleCommand({ type: 'ReadyUp'}, player4);
          interactableUpdateSpy.mockClear();
        });
        it('should throw an error when the game ID does not match', () => {
          expect(() =>
            gameArea.handleCommand(
              { type: 'GameMove', move: { cardPlaced: {color: "Blue", value: "0", src: ''} }, gameID: nanoid() },
              player1,
            ),
          ).toThrowError(GAME_ID_MISSMATCH_MESSAGE);
        });
        it('should dispatch the move to the game and call _emitAreaChanged', () => {
          const move: UnoMove = { cardPlaced: {color: "Blue", value: "0", src: ''} };
          const applyMoveSpy = jest.spyOn(game, 'applyMove');
          gameArea.handleCommand({ type: 'GameMove', move, gameID }, player1);
          expect(applyMoveSpy).toHaveBeenCalledWith({
            gameID: game.id,
            playerID: player1.id,
            move: {
              ...move,
            },
          });
          expect(interactableUpdateSpy).toHaveBeenCalledTimes(1);
        });
        it('should not call _emitAreaChanged if the game throws an error', () => {
          const move: UnoMove = { cardPlaced: {color: "Blue", value: "0", src: ''} };
          const applyMoveSpy = jest.spyOn(game, 'applyMove').mockImplementationOnce(() => {
            throw new Error('Test Error');
          });
          expect(() =>
            gameArea.handleCommand({ type: 'GameMove', move, gameID }, player1),
          ).toThrowError('Test Error');
          expect(applyMoveSpy).toHaveBeenCalledWith({
            gameID: game.id,
            playerID: player1.id,
            move: {
              ...move,
            },
          });
          expect(interactableUpdateSpy).not.toHaveBeenCalled();
        });
        describe('when the game is over, it records a new row in the history and calls _emitAreaChanged', () => {
          test('when first player wins', () => {
            const move: UnoMove = { cardPlaced: {color: "Blue", value: "0", src: ''} };
            jest.spyOn(game, 'applyMove').mockImplementationOnce(() => {
              game.endGame(player1.id);
            });
            gameArea.handleCommand({ type: 'GameMove', move, gameID }, player1);
            expect(game.state.status).toEqual('OVER');
            expect(gameArea.history.length).toEqual(1);
            expect(gameArea.history[0]).toEqual({
              gameID: game.id,
              scores: {
                [player1.userName]: 1,
                [player2.userName]: 0,
                [player3.userName]: 0,
                [player4.userName]: 0,
              },
            });
            expect(interactableUpdateSpy).toHaveBeenCalledTimes(1);
          });
          test('when last player wins', () => {
            const move: UnoMove = { cardPlaced: {color: "Blue", value: "0", src: ''} };
            jest.spyOn(game, 'applyMove').mockImplementationOnce(() => {
              game.endGame(player4.id);
            });
            gameArea.handleCommand({ type: 'GameMove', move, gameID }, player4);
            expect(game.state.status).toEqual('OVER');
            expect(gameArea.history.length).toEqual(1);
            expect(gameArea.history[0]).toEqual({
              gameID: game.id,
              scores: {
                [player1.userName]: 0,
                [player2.userName]: 0,
                [player3.userName]: 0,
                [player4.userName]: 1,
              },
            });
            expect(interactableUpdateSpy).toHaveBeenCalledTimes(1);
          });
        });
      });
    });
    describe('[T3.3] when given a LeaveGame command', () => {
      describe('when there is no game in progress', () => {
        it('should throw an error', () => {
          expect(() =>
            gameArea.handleCommand({ type: 'LeaveGame', gameID: nanoid() }, player1),
          ).toThrowError(GAME_NOT_IN_PROGRESS_MESSAGE);
          expect(interactableUpdateSpy).not.toHaveBeenCalled();
        });
      });
      describe('when there is a game in progress', () => {
        it('should throw an error when the game ID does not match', () => {
          gameArea.handleCommand({ type: 'JoinGame' }, player1);
          interactableUpdateSpy.mockClear();
          expect(() =>
            gameArea.handleCommand({ type: 'LeaveGame', gameID: nanoid() }, player1),
          ).toThrowError(GAME_ID_MISSMATCH_MESSAGE);
          expect(interactableUpdateSpy).not.toHaveBeenCalled();
        });
        it('should dispatch the leave command to the game and call _emitAreaChanged', () => {
          const { gameID } = gameArea.handleCommand({ type: 'JoinGame' }, player1);
          if (!game) {
            throw new Error('Game was not created by the first call to join');
          }
          expect(interactableUpdateSpy).toHaveBeenCalledTimes(1);
          const leaveSpy = jest.spyOn(game, 'leave');
          gameArea.handleCommand({ type: 'LeaveGame', gameID }, player1);
          expect(leaveSpy).toHaveBeenCalledWith(player1);
          expect(interactableUpdateSpy).toHaveBeenCalledTimes(2);
        });
        it('should not call _emitAreaChanged if the game throws an error', () => {
          gameArea.handleCommand({ type: 'JoinGame' }, player1);
          if (!game) {
            throw new Error('Game was not created by the first call to join');
          }
          interactableUpdateSpy.mockClear();
          const leaveSpy = jest.spyOn(game, 'leave').mockImplementationOnce(() => {
            throw new Error('Test Error');
          });
          expect(() =>
            gameArea.handleCommand({ type: 'LeaveGame', gameID: game.id }, player1),
          ).toThrowError('Test Error');
          expect(leaveSpy).toHaveBeenCalledWith(player1);
          expect(interactableUpdateSpy).not.toHaveBeenCalled();
        });
        it('should update the history if the game is over', () => {
          const { gameID } = gameArea.handleCommand({ type: 'JoinGame' }, player1);
          gameArea.handleCommand({ type: 'JoinGame' }, player2);
          interactableUpdateSpy.mockClear();
          jest.spyOn(game, 'leave').mockImplementationOnce(() => {
            game.endGame(player1.id);
          });
          gameArea.handleCommand({ type: 'LeaveGame', gameID }, player1);
          expect(game.state.status).toEqual('OVER');
          expect(gameArea.history.length).toEqual(1);
          expect(gameArea.history[0]).toEqual({
            gameID: game.id,
            scores: {
              [player1.userName]: 1,
              [player2.userName]: 0,
            },
          });
          expect(interactableUpdateSpy).toHaveBeenCalledTimes(1);
        });
      });
    });
    describe('[T3.4] when given a DrawFromDeck command', () => {
      it('should throw an error when there is no game in progress', () => {
        expect(() =>
          gameArea.handleCommand({ type: 'DrawFromDeck'},
          player1,
        ),
        ).toThrowError(GAME_NOT_IN_PROGRESS_MESSAGE);
      });
      describe('when there is a game in progress', () => {
        beforeEach(() => {
          gameArea.handleCommand({ type: 'JoinGame' }, player1);
          gameArea.handleCommand({ type: 'JoinGame' }, player2);
          gameArea.handleCommand({ type: 'JoinGame' }, player3);
          gameArea.handleCommand({ type: 'JoinGame' }, player4);
          gameArea.handleCommand({ type: 'ReadyUp'}, player1);
          gameArea.handleCommand({ type: 'ReadyUp'}, player2);
          gameArea.handleCommand({ type: 'ReadyUp'}, player3);
          gameArea.handleCommand({ type: 'ReadyUp'}, player4);
          interactableUpdateSpy.mockClear();
        });
        it('should dispatch the action to the game and call _emitAreaChanged', () => {
          const drawFromDeckSpy = jest.spyOn(game, 'drawFromDeck');
          gameArea.handleCommand({ type: 'DrawFromDeck',}, player1);
          const unoPlayer1: UnoPlayer | undefined = game._unoPlayers.find(p => p.id === player1.id);
          expect(drawFromDeckSpy).toHaveBeenCalledWith(unoPlayer1);
          expect(interactableUpdateSpy).toHaveBeenCalledTimes(1);
        });
        it('should not call _emitAreaChanged if the game throws an error', () => {
          const drawFromDeckSpy = jest.spyOn(game, 'drawFromDeck').mockImplementationOnce(() => {
            throw new Error('Test Error');
          });
          expect(() =>
            gameArea.handleCommand(
              { type: 'DrawFromDeck'},
              player1,
            ),
          ).toThrowError('Test Error');
          const unoPlayer1: UnoPlayer | undefined = game._unoPlayers.find(p => p.id === player1.id);
          expect(drawFromDeckSpy).toHaveBeenCalledWith(unoPlayer1);
          expect(interactableUpdateSpy).not.toHaveBeenCalled();
        });
      });
    });
    describe('[T3.5] when given a ChangeColorCommand command', () => {
      it('should throw an error when there is no game in progress', () => {
        expect(() =>
          gameArea.handleCommand(
            { type: 'ChangeColor', color: "Green"},
            player1,
          ),
        ).toThrowError(GAME_NOT_IN_PROGRESS_MESSAGE);
      });
      describe('when there is a game in progress', () => {
        beforeEach(() => {
          gameArea.handleCommand({ type: 'JoinGame' }, player1);
          gameArea.handleCommand({ type: 'JoinGame' }, player2);
          gameArea.handleCommand({ type: 'JoinGame' }, player3);
          gameArea.handleCommand({ type: 'JoinGame' }, player4);
          gameArea.handleCommand({ type: 'ReadyUp'}, player1);
          gameArea.handleCommand({ type: 'ReadyUp'}, player2);
          gameArea.handleCommand({ type: 'ReadyUp'}, player3);
          gameArea.handleCommand({ type: 'ReadyUp'}, player4);
          interactableUpdateSpy.mockClear();
        });
        it('should dispatch the action to the game and call _emitAreaChanged', () => {
          const updateColorSpy = jest.spyOn(game, 'updateColor');
          gameArea.handleCommand({ type: 'ChangeColor', color: "Green"}, player1);
          expect(updateColorSpy).toHaveBeenCalledWith("Green");
          expect(interactableUpdateSpy).toHaveBeenCalledTimes(1);
        });
        it('should not call _emitAreaChanged if the game throws an error', () => {
          const updateColorSpy = jest.spyOn(game, 'updateColor').mockImplementationOnce(() => {
            throw new Error('Test Error');
          });
          expect(() =>
            gameArea.handleCommand(
              { type: 'ChangeColor', color: "Green"},
              player1,
            ),
          ).toThrowError('Test Error');
          expect(updateColorSpy).toHaveBeenCalledWith("Green");
          expect(interactableUpdateSpy).not.toHaveBeenCalled();
        });
      });
    });
    describe('[T3.6] when given a ReadyUp command', () => {
      it('should throw an error when there is no game in progress', () => {
        expect(() =>
          gameArea.handleCommand(
            { type: 'ReadyUp'},
            player1,
          ),
        ).toThrowError(GAME_NOT_IN_PROGRESS_MESSAGE);
      });
      describe('when there is a game in progress', () => {
        beforeEach(() => {
          gameArea.handleCommand({ type: 'JoinGame' }, player1);
          gameArea.handleCommand({ type: 'JoinGame' }, player2);
          gameArea.handleCommand({ type: 'JoinGame' }, player3);
          gameArea.handleCommand({ type: 'JoinGame' }, player4);
          gameArea.handleCommand({ type: 'ReadyUp'}, player1);
          gameArea.handleCommand({ type: 'ReadyUp'}, player2);
          gameArea.handleCommand({ type: 'ReadyUp'}, player3);
          gameArea.handleCommand({ type: 'ReadyUp'}, player4);
          interactableUpdateSpy.mockClear();
        });
        it('should dispatch the action to the game and call _emitAreaChanged', () => {
          const readyUpSpy = jest.spyOn(game, 'playerReadyUp');
          gameArea.handleCommand({ type: 'ReadyUp'}, player1);
          const unoPlayer1: UnoPlayer | undefined = game._unoPlayers.find(p => p.id === player1.id);
          expect(readyUpSpy).toHaveBeenCalledWith(unoPlayer1);
          expect(interactableUpdateSpy).toHaveBeenCalledTimes(1);
        });
        it('should not call _emitAreaChanged if the game throws an error', () => {
          const readyUpSpy = jest.spyOn(game, 'playerReadyUp').mockImplementationOnce(() => {
            throw new Error('Test Error');
          });
          expect(() =>
            gameArea.handleCommand(
              { type: 'ReadyUp' },
              player1,
            ),
          ).toThrowError('Test Error');
          const unoPlayer1: UnoPlayer | undefined = game._unoPlayers.find(p => p.id === player1.id);
          expect(readyUpSpy).toHaveBeenCalledWith(unoPlayer1);
          expect(interactableUpdateSpy).not.toHaveBeenCalled();
        });
      });
    });
    describe('[T3.7] when given an invalid command', () => {
      it('should throw an error', () => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore (Testing an invalid command, only possible at the boundary of the type system)
        expect(() => gameArea.handleCommand({ type: 'InvalidCommand' }, player1)).toThrowError(
          INVALID_COMMAND_MESSAGE,
        );
        expect(interactableUpdateSpy).not.toHaveBeenCalled();
      });
    });
  });
});