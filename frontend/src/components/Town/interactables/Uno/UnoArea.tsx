import { Button, chakra, Container, useToast, Box, useStyleConfig } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import UnoAreaController from "../../../../classes/UnoAreaController"
import { PlayerGameObjects } from '../../../../classes/PlayerController';
import { Card, Player,UnoGameState, UnoMove, } from '../../../../types/CoveyTownSocket';

import { CARD } from '../../../../classes/UnoAreaController';


export type UnoAreaProp = {
  gameAreaController: UnoAreaController;
};

const Cards = ({UnoCard, ...rest}) => {
  const styles = useStyleConfig("Card", {UnoCard})
  return <Box __css={style} {...rest} />

}


/**
 * A component that will render a single cell in the TicTacToe board, styled
 */


export function UnoTable({gameAreaController} : UnoAreaProp){
  const ReadyButton = chakra(Button, {
    baseStyle: {
      justifyContent: 'center',
      alignItems: 'bottom',
      width: '100px', 
      height: '100px', 
      fontSize: '50px',
      backgroundColor: "red",
      borderRadius: '50%', 
      border: '1px solid black',
      _disabled: {
        opacity: '100%',
      },
    },
  });

  const eventHandler =;

 const staticCards =;

  
  const timer=;

  const DeckOfCards=;

  const numberOfCards=;

  const boxStyles = {
    p: " 10px",
    bg: "red.100",
    m: "10px",
    textAlign:"center"
  }

  return(
    <Box sx={boxStyles}>
      Template
    </Box>
  )

}


const CardInHands = chakra(Button,{baseStyle: {

}});

/**
 * A component that will render the TicTacToe board, styled
 */
const StyledTicTacToeBoard = chakra(Container, {
  baseStyle: {
    display: 'flex',
    width: '400px',
    height: '400px',
    padding: '5px',
    flexWrap: 'wrap',
  },
});

/**
 * A component that renders the TicTacToe board
 *
 * Renders the TicTacToe board as a "StyledTicTacToeBoard", which consists of 9 "StyledTicTacToeSquare"s
 * (one for each cell in the board, starting from the top left and going left to right, top to bottom).
 * Each StyledTicTacToeSquare has an aria-label property that describes the cell's position in the board,
 * formatted as `Cell ${rowIndex},${colIndex}`.
 *
 * The board is re-rendered whenever the board changes, and each cell is re-rendered whenever the value
 * of that cell changes.
 *
 * If the current player is in the game, then each StyledTicTacToeSquare is clickable, and clicking
 * on it will make a move in that cell. If there is an error making the move, then a toast will be
 * displayed with the error message as the description of the toast. If it is not the current player's
 * turn, then the StyledTicTacToeSquare will be disabled.
 *
 * @param gameAreaController the controller for the TicTacToe game
 */


export default function TicTacToeBoard({ gameAreaController }: TicTacToeGameProps): JSX.Element {
  const [board, setBoard] = useState<TicTacToeCell[][]>(gameAreaController.board);
  const [isOurTurn, setIsOurTurn] = useState(gameAreaController.isOurTurn);
  const toast = useToast();
  useEffect(() => {
    gameAreaController.addListener('turnChanged', setIsOurTurn);
    gameAreaController.addListener('boardChanged', setBoard);
    return () => {
      gameAreaController.removeListener('boardChanged', setBoard);
      gameAreaController.removeListener('turnChanged', setIsOurTurn);
    };
  }, [gameAreaController]);
  return (
    <StyledTicTacToeBoard aria-label='Tic-Tac-Toe Board'>
      {board.map((row, rowIndex) => {
        return row.map((cell, colIndex) => {
          return (
            <StyledTicTacToeSquare
              key={`${rowIndex}.${colIndex}`}
              onClick={async () => {
                try {
                  await gameAreaController.makeMove(
                    rowIndex as TicTacToeGridPosition,
                    colIndex as TicTacToeGridPosition,
                  );
                } catch (e) {
                  toast({
                    title: 'Error making move',
                    description: (e as Error).toString(),
                    status: 'error',
                  });
                }
              }}
              disabled={!isOurTurn}
              aria-label={`Cell ${rowIndex},${colIndex}`}>
              {cell}
            </StyledTicTacToeSquare>
          );
        });
      })}
    </StyledTicTacToeBoard>
  );
}
