/*
 * This section of code is adapted from or inspired by code available on GitHub:
 * Repository: https://github.com/neu-se/covey.town
 * File: covey.town/townService/src/town/games/TicTacToeBoard.ts
 * Author: Jonathan Bell
 */
/* eslint-disable react-hooks/rules-of-hooks */
import React, { useCallback, useEffect, useState } from 'react';
import { Box, Image, Flex, Button, useToast } from '@chakra-ui/react';
import { UnoCard } from '../../../classes/UnoCards';
import UnoCardComponent from './UnoCardComponent';
import { Card, Color, DeckOfCards, GameStatus, InteractableID, PlayerHands2DArray, UnoGameDirection, UnoMove, Value } from '../../../types/CoveyTownSocket';
import { useInteractable, useInteractableAreaController } from '../../../classes/TownController';
import UnoAreaController from '../../../classes/UnoAreaController';
import PlayerController from '../../../classes/PlayerController';
import UnoPlayer from '../../../../../townService/src/lib/UnoPlayer';
import useTownController from '../../../hooks/useTownController';

type UnoTableProps = {
  children?: React.ReactNode;
  readyPlayerIDs: string[];
};

export const BASE_PATH = '/assets/images/uno_assets_2d/PNGs/small';
export const CARD_BACK_IMAGE = '/assets/images/uno_assets_2d/PNGs/small/card_back.png';

/**
 * A component that renders the Uno table
 *
 * Renders the Uno table. The table is an oval with a deck of cards in the center and the players' hands.
 *
 * The table is re-rendered whenever the table changes. The table changes whenever a move is made.
 * 
 * If the current player is in the game, then they are able to ready themselves and deal cards when more than 1 player is in the game.
 * During the game, the player is able to draw a card if they cannot play a card. If there is an error making a move, then a toast will be
 * displayed with the error message as the description of the toast. If it is not the current player's
 * turn, then the player's hands will be disabled and not able to be interacted with.
 *
 * @param gameAreaController the controller for the Uno game
 */
const unoTable: React.FC<UnoTableProps & { interactableID: InteractableID }> = ({ interactableID }) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const gameAreaController = useInteractableAreaController<UnoAreaController>(interactableID);
  const townController = useTownController();
  const [gameStatus, setGameStatus] = useState<GameStatus>(gameAreaController.status);
  const [players, setPlayers] = useState<PlayerController[]>(gameAreaController.players);
  const [playersHands, setPlayersHands] = useState<PlayerHands2DArray | undefined>(gameAreaController.playersHands);
  const [mostRecentMove, setMostRecentMove] = useState< UnoMove | undefined>(gameAreaController.mostRecentMove);
  const [currentMovePlayer, setCurrentMovePlayer] = useState< PlayerController | undefined>(gameAreaController.currentMovePlayer);
  const [currentColor, setCurrentColor] = useState< Color | undefined>(gameAreaController.currentColor);
  const [currentCardValue, setCurrentCardValue] = useState< Value | undefined>(gameAreaController.currentCardValue);
  const [direction, setDirection] = useState<string | undefined>(gameAreaController.direction);
  const [isOurTurn, setIsOurTurn] = useState(gameAreaController.isOurTurn);
  const [ourHand, setOurHand] = useState<Card[]>(gameAreaController.ourHand);
  const [tableCards, setTableCards] = useState<Card[]>([
    {color: currentColor || "None", value: currentCardValue || "None", src: gameAreaController.currentImageSrc},
    {color: 'None',                 value: 'None',                     src: CARD_BACK_IMAGE}, // Face down card
  ]);
  const [colorChange, setColorChange] = useState(gameAreaController.colorChange);
  const [justPlayedPlayerID, setjustPlayedPlayerID] = useState(gameAreaController.justPlayedPlayerID);
  const [isReady, setIsReady] = useState(false);


  const toast = useToast();
  /**
   * Updates the game state based on changes from the game area controller.
   */
  useEffect(() => {
    const updateGameState = () => {
      setGameStatus(gameAreaController.status || 'WAITING_TO_START');
      setPlayers(gameAreaController.players);
      setPlayersHands(gameAreaController.playersHands);
      setCurrentCardValue(gameAreaController.currentCardValue);
      setCurrentColor(gameAreaController.currentColor);
      setCurrentMovePlayer(gameAreaController.currentMovePlayer);
      setDirection(gameAreaController.direction);
      setMostRecentMove(gameAreaController.mostRecentMove);
      setIsOurTurn(gameAreaController.isOurTurn);
      setOurHand(gameAreaController.ourHand);
      setTableCards(([
        {color: currentColor || "None", value: currentCardValue || "None", src: gameAreaController.currentImageSrc},
        {color: 'None',                 value: 'None',                     src: CARD_BACK_IMAGE},
      ]));
      setColorChange(gameAreaController.colorChange);
      setjustPlayedPlayerID(gameAreaController.justPlayedPlayerID);
    };
    gameAreaController.addListener('gameUpdated', updateGameState);
    return () => {
      gameAreaController.removeListener('gameUpdated', updateGameState);
    };
  });

  /**
   * Calculates the position of each player on the Uno table.
   * 
   * @param {number} index - The index of the player.
   * @param {number} ourPlayerIndex - The index of 'our' player.
   * @param {number} totalPlayers - The total number of players.
   * @returns {object} The style object containing position properties.
   */
  const calculatePlayerPosition = (index: number, ourPlayerIndex: number, totalPlayers: number) => {
    const relativeIndex = ((index - ourPlayerIndex + totalPlayers) % totalPlayers);
    const angle = (2 * Math.PI) / totalPlayers;
    const radius = 20; // Adjust this value as needed
    const x = 42.5 + radius * 1.5 * Math.sin(angle * relativeIndex);
    const y = 55 + radius * Math.cos(angle * relativeIndex);
    return { left: `${x}%`, top: `${y}%`,width: 'auto', height: 'auto',backgroundColor: 'transparent'};
  };

  const ourPlayerIndex = players.findIndex(player => player.id === townController.ourPlayer.id);

  /**
   * Renders the components representing each player on the Uno table.
   */
  const playerComponents = players.map((player, index) => {
    const position = calculatePlayerPosition(index, ourPlayerIndex, players.length);
    if (index !== ourPlayerIndex && playersHands && playersHands[index] !== undefined){
      return (
        <div key={player.id} style={{ position: 'absolute', ...position }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ marginRight: '20px' }}>{player.userName}</div>
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <div style={{ position: 'absolute', width: '40px', height: '40px', borderRadius: '50%', border: '2px solid #000', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}></div>
              <div style={{ position: 'relative', zIndex: 1 }}>{playersHands[index].length}</div>
            </div>
          </div>       
        </div>
      );
    }
  });

  /**
   * Renders the buttons for each card in the player's hand.
   * 
   * @param {Card[]} listOfCards - The list of cards in the player's hand.
   */
  const playerHandComponentButtons = (listOfCards: Card[]) => {
    const cardStyle = {
      width: '37.5px',
      height: '50px',
    };

    const buttonStyle = {
      ...cardStyle,
      minWidth:  '40px',
      minHeight: '50px',
      padding: '1px',
      backgroundColor: 'transparent',
    };

  
    return (
      <div className="player-hand" style={{ display: 'flex', justifyContent: 'flex-start' }}>
        {listOfCards.map((card : Card) => (
          <Button
            key={card.src}
            style={buttonStyle} 
            className="card-button" 
            disabled={!isOurTurn}
            onClick={async () => {
              const move: UnoMove = {cardPlaced: card};
              try { 
                await gameAreaController.makeMove(move);
              } catch (e) {
                toast ({
                  title: "Error Making Move",
                  description: (e as Error).toString(),
                  status: 'error',
                  duration: 1000,
                });
              }
            }}>
            <Image
              src={card.src}  
              alt={card.color} 
              style={cardStyle} 
            />
          </Button>
        ))}
      </div>
    );
  };

  /**
   * Renders the components representing the cards on the table.
   * 
   * @param {Card[]} _tableCards - The list of cards on the table.
   */
  const tableCardsComponent = (_tableCards: Card[]) => {
    const cardStyle = {
      width: '45px',
      height: '60px',
    };

    const buttonStyle = {
      ...cardStyle,
      padding: '0px', 
      backgroundColor: 'transparent',
    };
  
    return (
      <div className="player-hand" style={{ display: 'flex', justifyContent: 'flex-start'}}>
        <Image
          src={_tableCards[0].src}  
          alt={_tableCards[0].color} 
          style={cardStyle} 
        />
        <Button
          key={_tableCards[1].src}
          style={buttonStyle} 
          className="card-button"
          disabled={!isOurTurn || colorChange} 
          onClick={async () => {
            try { 
              await gameAreaController.drawCard();
            } catch (e) {
              toast ({
                title: "Error Drawing Card",
                description: (e as Error).toString(),
                status: 'error',
                duration: 1000,
              });
            }
          }}>
          <Image
            src={_tableCards[1].src}  
            alt={_tableCards[1].color} 
            style={cardStyle} 
          />
          </Button>
      </div>
    );
  };
  const colorSquareModalStyle = {
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', 
    zIndex: 1000,
  };

  /**
   * Renders the component for selecting a color when a 'Wild' card is played.
   */
  const colorSquareComponent = () => {
    const colors = ['yellow', 'blue', 'red', 'green'];
  
    const squareStyle = {
      flex: 1,
      width: '100px',
      height: '100px',
      display: 'flex',
      cursor: 'pointer',
      transition: 'transform 0.2s background-color 0.3s',
      borderRadius: '12px',
    };

    const componentStyle = {
      width: '212px',
      height: '212px',
      borderRadius: '16px',
      boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
      backgroundColor: 'black',
    };
  
    return (
      <>
        <style>
          {`
            .colorSquare:hover {
              opacity: 0.7;
            }
          `}
        </style>
        <div style={colorSquareModalStyle}>
          <div style={{ ...componentStyle, zIndex: 2000}}>
            <div style={{ display: 'flex' }}>
              <div className="colorSquare" style={{ ...squareStyle, backgroundColor: colors[0], margin: '4px 2px 2px 4px'}} onClick={() => gameAreaController.changeColor('Yellow')}>
              </div>
              <div className="colorSquare" style={{ ...squareStyle, backgroundColor: colors[1], margin: '4px 4px 2px 2px'}} onClick={() => gameAreaController.changeColor('Blue')}>
              </div>
            </div>
            <div style={{ display: 'flex' }}>
              <div className="colorSquare" style={{ ...squareStyle, backgroundColor: colors[2], margin: '2px 2px 4px 4px' }} onClick={() => gameAreaController.changeColor('Red')}>
              </div>
              <div className="colorSquare" style={{ ...squareStyle, backgroundColor: colors[3], margin: '2px 4px 4px 2px' }} onClick={() => gameAreaController.changeColor('Green')}>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  };

  /**
   * Styles the component for the Uno table.
   */
  const tableStyle: React.CSSProperties = {
    position: 'relative',
    width: '90%',
    height: '325px',
    backgroundColor: 'red',
    borderRadius: '50%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
    boxShadow: '0px 8px 16px rgba(0, 0, 0, 0.2)',
    border: '3px solid black',
    transform: 'translate(5%, 10%)'
  };

  const deckStyle: React.CSSProperties = {
    position: 'relative',
  };

  const playerHandStyle: React.CSSProperties = {
    position: 'absolute',
  };

  /**
   * Handles the click event for the "Ready Up" button, toggling the player's ready status.
   */

  const handleReadyClick = async () => {
    try {
      await gameAreaController.readyUp();
      setIsReady(!isReady);
      toast({
        title: isReady ? 'You are not ready!' : 'You are ready!',
        description: isReady ? 'You Have Unreadied' : 'You Have Readied Up',
        status: 'success',
        duration: 1000,
      });
    } catch (err) {
      toast({
        title: 'Error readying Up',
        description: (err as Error).toString(),
        status: 'error',
        duration: 1000,
      });
    }
  };
  const buttonStyle = {
    backgroundColor: isReady ? 'green' : 'red',
    color: 'white',
  };
  if (gameStatus === 'IN_PROGRESS') {
    return (
      <Flex style={tableStyle}>
        <Flex style={deckStyle}>
        {
         justPlayedPlayerID === townController.ourPlayer.id &&
         colorChange ? 
         colorSquareComponent() : tableCardsComponent(tableCards)
        }
        </Flex> 
        <Flex style={{...playerHandStyle, bottom: '10%', backgroundColor: 'rgba(0,0,0,.7)'}} justify="center">
          {playerHandComponentButtons(ourHand)}
        </Flex>
        <Flex style={{ position: 'absolute', top: '10%'}}>
          {playerComponents}
        </Flex>
      </Flex>
    );
  }
  else {
    return (
      <Flex direction="column" align="center" style={tableStyle}>
        {
          gameStatus === 'WAITING_TO_START' &&
          <Button 
            onClick={handleReadyClick} 
            style={buttonStyle}
            variant="outline" 
            colorScheme="teal" 
            size="lg">
            {isReady ? 'Unready' : 'Ready Up'}
          </Button>
        }
      {
        players.length > 1 &&
        <Button 
          onClick={async () => {
            try {
              await gameAreaController.dealCards();
            } catch (err) {
              toast({
                title: 'Error Dealing Cards',
                description: (err as Error).toString(),
                status: 'error',
                duration: 1000,
              });
            }
          }} 
          variant="outline" 
          colorScheme="white" 
          size="lg">
          Deal Cards
        </Button>
      }
    </Flex>
    );
  }
};

export default unoTable;
