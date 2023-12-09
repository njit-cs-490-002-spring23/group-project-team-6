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
};

export const BASE_PATH = '/assets/images/uno_assets_2d/PNGs/small';
export const CARD_BACK_IMAGE = '/assets/images/uno_assets_2d/PNGs/small/card_back.png';

const unoTable: React.FC<UnoTableProps & { interactableID: InteractableID }> = ({ children, interactableID }) => {
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

  const toast = useToast();
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
  }, [townController, gameAreaController, toast]);

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
        <div style={{ ...componentStyle }}>
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
      </>
    );
  };
  
  const playerHandComponent = (listOfCards: Card[]) => {
    const cardStyle = {
      width: '30px',
      height: '40px',
    };

    return (
      <div className="player-hand" style={{ display: 'flex'}}>
        {listOfCards.map((card: Card) => (
          <Image
            key={card.src}
            src={card.src}
            alt={card.color}
            style={cardStyle}
          ></Image>
        ))}
      </div>
    );
  };

  const [otherPlayersHands] = useState<Array<UnoCard[]>>(new Array(3).fill(new Array(6).fill({ src: CARD_BACK_IMAGE })));
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
    position: 'relative',
  };

  const topHandStyle: React.CSSProperties = {
    position: 'relative',
  };

  const leftHandStyle: React.CSSProperties = {
    position: 'relative',
    transform: 'rotate(-90deg)',
  };

  const rightHandStyle: React.CSSProperties = {
    position: 'relative',
    transform: 'rotate(90deg)',
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
        <Flex style={{ ...playerHandStyle, padding: '2px', position: 'absolute', bottom: '10%', alignItems: "center", backgroundColor: 'rgba(0,0,0,.7)'}}>
          {playerHandComponentButtons(ourHand)}
        </Flex>

        <Flex style={{ ...topHandStyle, position: 'absolute', top: '10%' }}>
          {playerHandComponent(otherPlayersHands[0])}
        </Flex>

        <Flex style={{ ...leftHandStyle, position: 'absolute', left: '5%', top: '50%', transform: 'translateY(-50%) rotate(-90deg)' }}>
          {playerHandComponent(otherPlayersHands[1])}
        </Flex>

        <Flex style={{ ...rightHandStyle, position: 'absolute', right: '5%', top: '50%', transform: 'translateY(-50%) rotate(90deg)' }}>
          {playerHandComponent(otherPlayersHands[2])}
        </Flex>
      </Flex>
    );
  }
  else {
    return (
      <Flex direction="column" align="center" style={tableStyle}>
      <Button 
        onClick={async () => {
          try {
            await gameAreaController.readyUp();
          } catch (err) {
            toast({
              title: 'Error readying Up',
              description: (err as Error).toString(),
              status: 'error',
            });
          }
        }} 
        variant="outline" 
        colorScheme="teal" 
        size="lg">
        Ready Up
      </Button>
      <Button 
        onClick={async () => {
          try {
            await gameAreaController.dealCards();
          } catch (err) {
            toast({
              title: 'Error Dealing Cards',
              description: (err as Error).toString(),
              status: 'error',
            });
          }
        }} 
        variant="outline" 
        colorScheme="white" 
        size="lg">
        Deal Cards
      </Button>
    </Flex>
    );
  }
};

export default unoTable;
