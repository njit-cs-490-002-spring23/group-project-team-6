import { createUnoPlayerForTesting } from '../../TestUtils';
import {
  PLAYER_NOT_IN_GAME_MESSAGE,
  PLAYER_ALREADY_IN_GAME_MESSAGE,
  GAME_FULL_MESSAGE,
  NOT_YOUR_TURN_MESSAGE,
  INVALID_MOVE_MESSAGE,
} from '../../lib/InvalidParametersError';
import { GameMove, UnoMove } from '../../types/CoveyTownSocket';
import UnoGame from './UnoGame';

describe('UnoGame', () => {
  let game: UnoGame;
  beforeEach(() => {
    game = new UnoGame();
  });
  describe('[T1.1] Ready Up Player by Player', () => {
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
  describe('[T1.2] join', () => {
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
        expect(player1.playerToRight?.id).toEqual(player2.id);
        expect(player2.playerToLeft?.id).toEqual(player1.id);
        expect(player2.playerToRight?.id).toEqual(player1.id);
       
        game.join(player3);
        game.join(player4);
        game.join(player5);
        game.join(player6);
        expect(player1.playerToLeft?.id).toEqual(player6.id);
        expect(player1.playerToRight?.id).toEqual(player2.id);
        expect(player2.playerToLeft?.id).toEqual(player1.id);
        expect(player2.playerToRight?.id).toEqual(player3.id);
        expect(player3.playerToLeft?.id).toEqual(player2.id);
        expect(player3.playerToRight?.id).toEqual(player4.id);
        expect(player4.playerToLeft?.id).toEqual(player3.id);
        expect(player4.playerToRight?.id).toEqual(player5.id);
        expect(player5.playerToLeft?.id).toEqual(player4.id);
        expect(player5.playerToRight?.id).toEqual(player6.id);
        expect(player6.playerToLeft?.id).toEqual(player5.id);
        expect(player6.playerToRight?.id).toEqual(player1.id);
      });
    });
 });
  describe('[T1.3] _leave', () => {
    it('should throw an error if the player is not in the game', () => {
      expect(() => game.leave(createUnoPlayerForTesting())).toThrowError(PLAYER_NOT_IN_GAME_MESSAGE);
      const player = createUnoPlayerForTesting();
      game.join(player);
      expect(() => game.leave(createUnoPlayerForTesting())).toThrowError(PLAYER_NOT_IN_GAME_MESSAGE);
    });
    describe('when the player is in the game', () => {
      describe('when the game is in progress,', () => {
        it('should set the game status to OVER and declare the other player the winner', () => {
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
          game.playerReadyUp(player1)
          game.playerReadyUp(player2)
          game.playerReadyUp(player3)
          game.playerReadyUp(player4)
          game.playerReadyUp(player5)
          game.playerReadyUp(player6)
          game.leave(player1);
          game.leave(player2);
          game.leave(player3);
          game.leave(player4);
          game.leave(player5);
          expect(game.state.status).toEqual('OVER');
          expect(game.state.winner).toEqual(player6.id);      
        }); 
      });
      describe('when the game is not in progress,', () => {
        it('should set the game status to WAITING_TO_START and remove the player', () => {
          const player1 = createUnoPlayerForTesting();
          game.join(player1);
          expect(game.state.status).toEqual('WAITING_TO_START');
          expect(game.state.winner).toBeUndefined();
          game.leave(player1);
          expect(game.state.status).toEqual('WAITING_TO_START');
          expect(game.state.winner).toBeUndefined();
        });
      });
    });
  });
  describe('[T1.4] checkIfPlayersReadyandDealCards', () => {
    it('should deal 7 cards to each player only if they are all ready', () => {
      const player1 = createUnoPlayerForTesting();
      const player2 = createUnoPlayerForTesting();
      const player3 = createUnoPlayerForTesting();
      const player4 = createUnoPlayerForTesting();
      game.join(player1);
      game.join(player2);
      game.join(player3);
      game.join(player4);
      game.playerReadyUp(player1)
      game.playerReadyUp(player2)
      game.playerReadyUp(player3)
      expect(player1.cardsInHand.length).toEqual(0);
      expect(player2.cardsInHand.length).toEqual(0);
      expect(player3.cardsInHand.length).toEqual(0);
      expect(player4.cardsInHand.length).toEqual(0);
      game.playerReadyUp(player4)
      expect(player1.cardsInHand.length).toEqual(7);
      expect(player2.cardsInHand.length).toEqual(7);
      expect(player3.cardsInHand.length).toEqual(7);
      expect(player4.cardsInHand.length).toEqual(7);
    });
  });
  describe('[T1.5] applyMove(move: GameMove<UnoMove>) - regular/invalid moves', () => {
    it('should validate the cards and throw an error if an invalid card is placed', () => {
      const player1 = createUnoPlayerForTesting();
      const player2 = createUnoPlayerForTesting();
      const player3 = createUnoPlayerForTesting();
      const player4 = createUnoPlayerForTesting();
      game.join(player1);
      game.join(player2);
      game.join(player3);
      game.join(player4);
      game.playerReadyUp(player1);
      game.playerReadyUp(player2);
      game.playerReadyUp(player3);
      game.playerReadyUp(player4);
      const player1Move1UnoMove: UnoMove = {
        cardPlaced: {
          color: 'Red', 
          value: '0',
        },
      };
      const player1Move1: GameMove<UnoMove> = {
        playerID: player1.id,
        gameID: game.id,
        move: player1Move1UnoMove
      }
      const player2Move1InvalidUnoMove: UnoMove = {
        cardPlaced: {
          color: 'Green', 
          value: '5',
        },
      };
      const player2InvalidMove1: GameMove<UnoMove> = {
        playerID: player2.id,
        gameID: game.id,
        move: player2Move1InvalidUnoMove
      }
      const player2Move1UnoMove: UnoMove = {
        cardPlaced: {
          color: 'Red', 
          value: '5',
        },
      };
      const player2Move1: GameMove<UnoMove> = {
        playerID: player2.id,
        gameID: game.id,
        move: player2Move1UnoMove
      }
      expect(() => game.applyMove(player2InvalidMove1)).toThrowError(NOT_YOUR_TURN_MESSAGE);
      game.applyMove(player1Move1);
      expect(game.state.currentCardValue).toEqual('0');
      expect(game.state.currentColor).toEqual('Red');
      expect(game.state.currentMovePlayer._player.id).toBe(player2._player.id);
      expect(game.state.direction).toEqual('Counter_Clockwise');
      expect(game.state.mostRecentMove).toBe(player1Move1UnoMove);
      expect(game.state.numberOfMovesSoFar).toEqual(1);
      expect(game.state.winner).toBeUndefined();
      expect(game.state.status).toEqual('IN_PROGRESS');
      expect(() => game.applyMove(player2InvalidMove1)).toThrowError(INVALID_MOVE_MESSAGE);
      game.applyMove(player2Move1);
      expect(game.state.currentCardValue).toEqual('5');
      expect(game.state.currentColor).toEqual('Red');
      expect(game.state.currentMovePlayer.id).toBe(player3.id);
      expect(game.state.direction).toEqual('Counter_Clockwise');
      expect(game.state.mostRecentMove).toBe(player2Move1UnoMove);
      expect(game.state.numberOfMovesSoFar).toEqual(2);
      expect(game.state.status).toEqual('IN_PROGRESS');
      expect(game.state.winner).toBeUndefined();
    });
  });
  describe('[T1.6] applyMove(move: GameMove<UnoMove>) - +2 Cards', () => {
    it('should add two cards to the next player and skip them if a valid +2 is played', () => {
      const player1 = createUnoPlayerForTesting();
      const player2 = createUnoPlayerForTesting();
      const player3 = createUnoPlayerForTesting();
      const player4 = createUnoPlayerForTesting();
      game.join(player1);
      game.join(player2);
      game.join(player3);
      game.join(player4);
      game.playerReadyUp(player1);
      game.playerReadyUp(player2);
      game.playerReadyUp(player3);
      game.playerReadyUp(player4);
      const player1Move1UnoMove: UnoMove = {
        cardPlaced: {
          color: 'Red', 
          value: '0',
        },
      };
      const player1Move1: GameMove<UnoMove> = {
        playerID: player1.id,
        gameID: game.id,
        move: player1Move1UnoMove
      }
      const player2Move1UnoMove: UnoMove = {
        cardPlaced: {
          color: 'Red', 
          value: '5',
        },
      };
      const player2Move1: GameMove<UnoMove> = {
        playerID: player2.id,
        gameID: game.id,
        move: player2Move1UnoMove
      }
      const player3Move1UnoMove: UnoMove = {
        cardPlaced: {
          color: 'Red', 
          value: 'Draw Two',
        },
      };
      const player3Move1: GameMove<UnoMove> = {
        playerID: player3.id,
        gameID: game.id,
        move: player3Move1UnoMove
      }
      game.applyMove(player1Move1);
      game.applyMove(player2Move1);
      game.applyMove(player3Move1);
      expect(game.state.currentCardValue).toEqual('Draw Two');
      expect(game.state.currentColor).toEqual('Red');
      expect(player4.cardsInHand.length).toEqual(9);
      expect(game.state.currentMovePlayer.id).toBe(player1.id);
      expect(game.state.direction).toEqual('Counter_Clockwise');
      expect(game.state.mostRecentMove).toBe(player3Move1UnoMove);
      expect(game.state.numberOfMovesSoFar).toEqual(3);
      expect(game.state.winner).toBeUndefined();
      expect(game.state.status).toEqual('IN_PROGRESS');
    });
  });
  describe('[T1.7] applyMove(move: GameMove<UnoMove>) - Reverse Cards', () => {
    it('should reverse the order of rotation of turns and bring the turn back to the previous player', () => {
      const player1 = createUnoPlayerForTesting();
      const player2 = createUnoPlayerForTesting();
      const player3 = createUnoPlayerForTesting();
      const player4 = createUnoPlayerForTesting();
      game.join(player1);
      game.join(player2);
      game.join(player3);
      game.join(player4);
      game.playerReadyUp(player1);
      game.playerReadyUp(player2);
      game.playerReadyUp(player3);
      game.playerReadyUp(player4);
      expect(game.state.currentMovePlayer).toBeUndefined();
      const player1Move1UnoMove: UnoMove = {
        cardPlaced: {
          color: 'Red', 
          value: '0',
        },
      };
      const player1Move1: GameMove<UnoMove> = {
        playerID: player1.id,
        gameID: game.id,
        move: player1Move1UnoMove
      }
      const player2Move1UnoMove: UnoMove = {
        cardPlaced: {
          color: 'Red', 
          value: '5',
        },
      };
      const player2Move1: GameMove<UnoMove> = {
        playerID: player2.id,
        gameID: game.id,
        move: player2Move1UnoMove
      }
      const player3Move1UnoMove: UnoMove = {
        cardPlaced: {
          color: 'Red', 
          value: 'Draw Two',
        },
      };
      const player3Move1: GameMove<UnoMove> = {
        playerID: player3.id,
        gameID: game.id,
        move: player3Move1UnoMove
      }
      const player1Move2UnoMove: UnoMove = {
        cardPlaced: {
          color: 'Red', 
          value: 'Reverse',
        },
      };
      const player1Move2: GameMove<UnoMove> = {
        playerID: player1.id,
        gameID: game.id,
        move: player1Move2UnoMove
      }

      game.applyMove(player1Move1);
      game.applyMove(player2Move1);
      game.applyMove(player3Move1);
      game.applyMove(player1Move2);
      expect(game.state.currentCardValue).toEqual('Reverse');
      expect(game.state.currentColor).toEqual('Red');
      expect(game.state.currentMovePlayer.id).toBe(player4.id);
      expect(game.state.direction).toEqual('Clockwise');
      expect(game.state.mostRecentMove).toBe(player1Move2UnoMove);
      expect(game.state.numberOfMovesSoFar).toEqual(4);
      expect(game.state.winner).toBeUndefined();
      expect(game.state.status).toEqual('IN_PROGRESS');
    });
  });
  describe('[T1.8] applyMove(move: GameMove<UnoMove>) - Skip Cards', () => {
    it('should skip the next player and make the turn the next player\'s', () => {
      const player1 = createUnoPlayerForTesting();
      const player2 = createUnoPlayerForTesting();
      const player3 = createUnoPlayerForTesting();
      const player4 = createUnoPlayerForTesting();
      game.join(player1);
      game.join(player2);
      game.join(player3);
      game.join(player4);
      game.playerReadyUp(player1);
      game.playerReadyUp(player2);
      game.playerReadyUp(player3);
      game.playerReadyUp(player4);
      expect(game.state.currentMovePlayer).toBeUndefined();
      const player1Move1UnoMove: UnoMove = {
        cardPlaced: {
          color: 'Red', 
          value: '0',
        },
      };
      const player1Move1: GameMove<UnoMove> = {
        playerID: player1.id,
        gameID: game.id,
        move: player1Move1UnoMove
      }
      const player2Move1UnoMove: UnoMove = {
        cardPlaced: {
          color: 'Red', 
          value: '5',
        },
      };
      const player2Move1: GameMove<UnoMove> = {
        playerID: player2.id,
        gameID: game.id,
        move: player2Move1UnoMove
      }
      const player3Move1UnoMove: UnoMove = {
        cardPlaced: {
          color: 'Red', 
          value: 'Draw Two',
        },
      };
      const player3Move1: GameMove<UnoMove> = {
        playerID: player3.id,
        gameID: game.id,
        move: player3Move1UnoMove
      }
      const player1Move2UnoMove: UnoMove = {
        cardPlaced: {
          color: 'Red', 
          value: 'Reverse',
        },
      };
      const player1Move2: GameMove<UnoMove> = {
        playerID: player1.id,
        gameID: game.id,
        move: player1Move2UnoMove
      }
      const player4Move1UnoMove: UnoMove = {
        cardPlaced: {
          color: 'Red', 
          value: 'Skip',
        },
      };
      const player4Move1: GameMove<UnoMove> = {
        playerID: player4.id,
        gameID: game.id,
        move: player4Move1UnoMove
      }
      game.applyMove(player1Move1);
      game.applyMove(player2Move1);
      game.applyMove(player3Move1);
      game.applyMove(player1Move2);
      game.applyMove(player4Move1);
      expect(game.state.currentCardValue).toEqual('Skip');
      expect(game.state.currentColor).toEqual('Red');
      expect(game.state.currentMovePlayer.id).toBe(player2.id);
      expect(game.state.direction).toEqual('Clockwise');
      expect(game.state.mostRecentMove).toBe(player4Move1UnoMove);
      expect(game.state.numberOfMovesSoFar).toEqual(5);
      expect(game.state.winner).toBeUndefined();
      expect(game.state.status).toEqual('IN_PROGRESS');
    });
  });
  describe('[T1.9] applyMove(move: GameMove<UnoMove>) - Wild Cards', () => {
    it('should change the color to the desired color, calling the updateColor function', () => {
      const player1 = createUnoPlayerForTesting();
      const player2 = createUnoPlayerForTesting();
      const player3 = createUnoPlayerForTesting();
      const player4 = createUnoPlayerForTesting();
      game.join(player1);
      game.join(player2);
      game.join(player3);
      game.join(player4);
      game.playerReadyUp(player1);
      game.playerReadyUp(player2);
      game.playerReadyUp(player3);
      game.playerReadyUp(player4);
      expect(game.state.currentMovePlayer).toBeUndefined();
      const player1Move1UnoMove: UnoMove = {
        cardPlaced: {
          color: 'Red', 
          value: '0',
        },
      };
      const player1Move1: GameMove<UnoMove> = {
        playerID: player1.id,
        gameID: game.id,
        move: player1Move1UnoMove
      }
      const player2Move1UnoMove: UnoMove = {
        cardPlaced: {
          color: 'Red', 
          value: '5',
        },
      };
      const player2Move1: GameMove<UnoMove> = {
        playerID: player2.id,
        gameID: game.id,
        move: player2Move1UnoMove
      }
      const player3Move1UnoMove: UnoMove = {
        cardPlaced: {
          color: 'Red', 
          value: 'Draw Two',
        },
      };
      const player3Move1: GameMove<UnoMove> = {
        playerID: player3.id,
        gameID: game.id,
        move: player3Move1UnoMove
      }
      const player1Move2UnoMove: UnoMove = {
        cardPlaced: {
          color: 'Red', 
          value: 'Reverse',
        },
      };
      const player1Move2: GameMove<UnoMove> = {
        playerID: player1.id,
        gameID: game.id,
        move: player1Move2UnoMove
      }
      const player4Move1UnoMove: UnoMove = {
        cardPlaced: {
          color: 'Red', 
          value: 'Skip',
        },
      };
      const player4Move1: GameMove<UnoMove> = {
        playerID: player4.id,
        gameID: game.id,
        move: player4Move1UnoMove
      }
      const player2Move2UnoMove: UnoMove = {
        cardPlaced: {
          color: 'Wild', 
          value: 'Wild',
        },
      };
      const player2Move2: GameMove<UnoMove> = {
        playerID: player2.id,
        gameID: game.id,
        move: player2Move2UnoMove
      }
      game.applyMove(player1Move1);
      game.applyMove(player2Move1);
      game.applyMove(player3Move1);
      game.applyMove(player1Move2);
      game.applyMove(player4Move1);
      game.applyMove(player2Move2);
      game.updateColor("Green");
      expect(game.state.currentCardValue).toEqual('Wild');
      expect(game.state.currentColor).toEqual('Green');
      expect(game.state.currentMovePlayer.id).toBe(player1.id);
      expect(game.state.direction).toEqual('Clockwise');
      expect(game.state.mostRecentMove).toBe(player2Move2UnoMove);
      expect(game.state.numberOfMovesSoFar).toEqual(6);
      expect(game.state.winner).toBeUndefined();
      expect(game.state.status).toEqual('IN_PROGRESS');
    });
  });
  describe('[T1.10] applyMove(move: GameMove<UnoMove>) - Wild Draw four Cards', () => {
    it('should add 4 cards to the next player, skip them and make the turn the next player\'s', () => {
      const player1 = createUnoPlayerForTesting();
      const player2 = createUnoPlayerForTesting();
      const player3 = createUnoPlayerForTesting();
      const player4 = createUnoPlayerForTesting();
      game.join(player1);
      game.join(player2);
      game.join(player3);
      game.join(player4);
      game.playerReadyUp(player1);
      game.playerReadyUp(player2);
      game.playerReadyUp(player3);
      game.playerReadyUp(player4);
      expect(game.state.currentMovePlayer).toBeUndefined();
      const player1Move1UnoMove: UnoMove = {
        cardPlaced: {
          color: 'Red', 
          value: '0',
        },
      };
      const player1Move1: GameMove<UnoMove> = {
        playerID: player1.id,
        gameID: game.id,
        move: player1Move1UnoMove
      }
      const player2Move1UnoMove: UnoMove = {
        cardPlaced: {
          color: 'Red', 
          value: '5',
        },
      };
      const player2Move1: GameMove<UnoMove> = {
        playerID: player2.id,
        gameID: game.id,
        move: player2Move1UnoMove
      }
      const player3Move1UnoMove: UnoMove = {
        cardPlaced: {
          color: 'Red', 
          value: 'Draw Two',
        },
      };
      const player3Move1: GameMove<UnoMove> = {
        playerID: player3.id,
        gameID: game.id,
        move: player3Move1UnoMove
      }
      const player1Move2UnoMove: UnoMove = {
        cardPlaced: {
          color: 'Red', 
          value: 'Reverse',
        },
      };
      const player1Move2: GameMove<UnoMove> = {
        playerID: player1.id,
        gameID: game.id,
        move: player1Move2UnoMove
      }
      const player4Move1UnoMove: UnoMove = {
        cardPlaced: {
          color: 'Red', 
          value: 'Skip',
        },
      };
      const player4Move1: GameMove<UnoMove> = {
        playerID: player4.id,
        gameID: game.id,
        move: player4Move1UnoMove
      }
      const player2Move2UnoMove: UnoMove = {
        cardPlaced: {
          color: 'Wild', 
          value: 'Wild',
        },
      };
      const player2Move2: GameMove<UnoMove> = {
        playerID: player2.id,
        gameID: game.id,
        move: player2Move2UnoMove
      }
      const player1Move3UnoMove: UnoMove = {
        cardPlaced: {
          color: 'Wild', 
          value: 'Wild Draw Four',
        },
      };
      const player1Move3: GameMove<UnoMove> = {
        playerID: player1.id,
        gameID: game.id,
        move: player1Move3UnoMove
      }
      game.applyMove(player1Move1);
      game.applyMove(player2Move1);
      game.applyMove(player3Move1);
      game.applyMove(player1Move2);
      game.applyMove(player4Move1);
      game.applyMove(player2Move2);
      game.updateColor("Green");
      game.applyMove(player1Move3);
      game.updateColor("Blue");
      expect(game.state.currentCardValue).toEqual('Wild Draw Four');
      expect(game.state.currentColor).toEqual('Blue');
      expect(player4.cardsInHand.length).toEqual(13);
      expect(game.state.currentMovePlayer.id).toBe(player3.id);
      expect(game.state.direction).toEqual('Clockwise');
      expect(game.state.mostRecentMove).toBe(player1Move3UnoMove);
      expect(game.state.numberOfMovesSoFar).toEqual(7);
      expect(game.state.winner).toBeUndefined();
      expect(game.state.status).toEqual('IN_PROGRESS');
    });
  });
});

