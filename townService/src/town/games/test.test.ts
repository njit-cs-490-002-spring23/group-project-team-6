import { createPlayerForTesting } from '../../TestUtils';
import {
  PLAYER_NOT_IN_GAME_MESSAGE,
  PLAYER_ALREADY_IN_GAME_MESSAGE,
  INVALID_MOVE_MESSAGE,
  GAME_FULL_MESSAGE,
  GAME_HASNT_STARTED_MESSAGE
} from '../../lib/InvalidParametersError';
import UnoGame from './UnoGame';
import Player from '../../lib/Player';
import UnoPlayer from '../../lib/UnoPlayer';
import { UnoMove } from '../../types/CoveyTownSocket';
describe('UnoGame', () => {
  let game: UnoGame;

  beforeEach(() => {
    game = new UnoGame();
  });
  describe('Ready Up Player by Player', () => {
    it('should throw an error if the player is not in the game', () => {
        const player = createPlayerForTesting();
        game.join(player);
        console.log("----------------");
        if (!player){
            console.error('createPlayerForTesting() returned undefined.');
        }
        if (!game){
            console.error('UnoGame() returned undefined.');
        }
        console.log("----------------");  
    });
  });
});
