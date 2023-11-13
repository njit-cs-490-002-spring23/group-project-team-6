import { createUnoPlayerForTesting } from '../../TestUtils';
import {
  PLAYER_NOT_IN_GAME_MESSAGE,
  PLAYER_ALREADY_IN_GAME_MESSAGE,
  INVALID_MOVE_MESSAGE,
  GAME_FULL_MESSAGE,
  GAME_HASNT_STARTED_MESSAGE
} from '../../lib/InvalidParametersError';
import UnoGame from './UnoGame';
import { UnoMove } from '../../types/CoveyTownSocket';
describe('UnoGame', () => {
  let game: UnoGame;
  beforeEach(() => {
    game = new UnoGame();
  });
  describe('Ready Up Player by Player', () => {
    it('should throw an error if the player is not in the game', () => {
        const player = createUnoPlayerForTesting();
        expect(() => game.playerReadyUp(player)).toThrowError(PLAYER_NOT_IN_GAME_MESSAGE);
      });
    it('should mark all players who are ready as ready', () => {
        const player1 = createUnoPlayerForTesting();
        const player2 = createUnoPlayerForTesting();
        const player3 = createUnoPlayerForTesting();
        const player4 = createUnoPlayerForTesting();
        const player5 = createUnoPlayerForTesting();
        const player6 = createUnoPlayerForTesting();
        game.join(player1);
        expect(player1.readyUp).toBe(false);
        game.join(player2);
        expect(player2.readyUp).toBe(false);
        game.join(player3);
        expect(player3.readyUp).toBe(false);
        game.join(player4);
        expect(player4.readyUp).toBe(false);
        game.join(player5);
        expect(player5.readyUp).toBe(false);
        game.join(player6);
        expect(player6.readyUp).toBe(false);
        game.playerReadyUp(player1);
        game.playerReadyUp(player2);
        game.playerReadyUp(player3);
        game.playerReadyUp(player4);
        game.playerReadyUp(player5);
        game.playerReadyUp(player6);
        expect(player1.readyUp).toBe(true);
        expect(player2.readyUp).toBe(true);
        expect(player3.readyUp).toBe(true);
        expect(player4.readyUp).toBe(true);
        expect(player5.readyUp).toBe(true);
        expect(player6.readyUp).toBe(true);
    });
  });
  describe('[T1.1] join', () => {
    it('should throw an error if the player is already in the game', () => {
        const player = createUnoPlayerForTesting();
        game.join(player);
        expect(() => game.join(player)).toThrowError(PLAYER_ALREADY_IN_GAME_MESSAGE);
        const player2 = createUnoPlayerForTesting();
        game.join(player2);
        expect(() => game.join(player2)).toThrowError(PLAYER_ALREADY_IN_GAME_MESSAGE);
      });
    it('should throw an error if the game is full', () => {
        const player1 = createUnoPlayerForTesting();
        const player2 = createUnoPlayerForTesting();
        const player3 = createUnoPlayerForTesting();
        const player4 = createUnoPlayerForTesting();
        const player5 = createUnoPlayerForTesting();
        const player6 = createUnoPlayerForTesting();
        const player7 = createUnoPlayerForTesting();
        game.join(player1);
        game.join(player2);
        game.join(player3);
        game.join(player4);
        game.join(player5);
        game.join(player6);
        expect(() => game.join(player7)).toThrowError(GAME_FULL_MESSAGE);
      });
    describe('When the player can be added', () => {
      it('assigns every player in the game a player to left and player to right and initializes the state with status WAITING_TO_START ', () => {
        const player1 = createUnoPlayerForTesting();
        const player2 = createUnoPlayerForTesting();
        const player3 = createUnoPlayerForTesting();
        const player4 = createUnoPlayerForTesting();
        const player5 = createUnoPlayerForTesting();
        const player6 = createUnoPlayerForTesting();
        game.join(player1);
        expect(game.state.status).toEqual('WAITING_TO_START');
        game.join(player2);
        expect(player1.playerToLeft?.id).toEqual(player2.id);
        expect(player1.playerToLeft?.id).toEqual(player2.id);
        expect(player2.playerToLeft?.id).toEqual(player1.id);
        expect(player2.playerToLeft?.id).toEqual(player1.id);
        game.join(player3);
        game.join(player4);
        game.join(player5);
        game.join(player6);
        expect(player1.playerToLeft?.id).toEqual(player6.id);
        expect(player1.playerToLeft?.id).toEqual(player2.id);
        expect(player2.playerToLeft?.id).toEqual(player1.id);
        expect(player2.playerToLeft?.id).toEqual(player3.id);
        expect(player3.playerToLeft?.id).toEqual(player2.id);
        expect(player3.playerToLeft?.id).toEqual(player4.id);
        expect(player4.playerToLeft?.id).toEqual(player3.id);
        expect(player4.playerToLeft?.id).toEqual(player5.id);
        expect(player5.playerToLeft?.id).toEqual(player4.id);
        expect(player5.playerToLeft?.id).toEqual(player6.id);
        expect(player6.playerToLeft?.id).toEqual(player5.id);
        expect(player6.playerToLeft?.id).toEqual(player1.id);
      });
    });
 });/*
  describe('[T1.2] _leave', () => {
    it('should throw an error if the player is not in the game', () => {
      expect(() => game.leave(createUnoPlayerForTesting())).toThrowError(PLAYER_NOT_IN_GAME_MESSAGE);
      // TODO weaker test suite only does one of these - above or below
      const player = createUnoPlayerForTesting();
      game.join(player);
      expect(() => game.leave(createUnoPlayerForTesting())).toThrowError(PLAYER_NOT_IN_GAME_MESSAGE);
    });
    describe('when the player is in the game', () => {
      describe('when the game is in progress, it should set the game status to OVER and declare the other player the winner', () => {
        const player1 = createUnoPlayerForTesting();
        const player2 = createUnoPlayerForTesting();
        const player3 = createUnoPlayerForTesting();
        const player4 = createUnoPlayerForTesting();
        const player5 = createUnoPlayerForTesting();
        const player6 = createUnoPlayerForTesting();
        game.join(player1);
        game.join(player2);
        game.join(player3);
        game.join(player4);
        game.join(player5);
        game.join(player6);
        game.playerReadyUp(player1);
        game.playerReadyUp(player2);
        game.playerReadyUp(player3);
        game.playerReadyUp(player4);
        game.playerReadyUp(player5);
        game.playerReadyUp(player6);
        game.leave(player1);
        game.leave(player2);
        game.leave(player3);
        game.leave(player4);
        game.leave(player5);
        expect(game.state.status).toEqual('OVER');
        expect(game.state.winner).toEqual(player6.id);       
      });
      it('when the game is not in progress, it should set the game status to WAITING_TO_START and remove the player', () => {
        const player1 = createUnoPlayerForTesting();
        game.join(player1);
        expect(game.state.status).toEqual('WAITING_TO_START');
        expect(game.state.winner).toBeUndefined();
        game.leave(player1);
        expect(game.state.status).toEqual('WAITING_TO_START');
        expect(game.state.winner).toBeUndefined();
      });
    });
  });*/
  describe('applyMove', () => {
    describe('when ', () => {  
      }); 
      describe('[T2.3] when ', () => {
        describe('it checks ', () => {
          describe('a ', () => {
            test('__', () => {        
            });
            test('__', () => {        
            });
          });
          describe('__', () => {
            test('__', () => {
              
            });
            test('__', () => {
              
            });
          });
          describe('__', () => {
            test('__', () => {

            });
            test('__', () => {
              
            });
            test('__', () => {
              
            });
            test('__', () => {
              
            });
          });
        });
        it('declares ', () => {
        });
      });
    });
});
