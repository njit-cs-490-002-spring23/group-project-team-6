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
        {color: 'None',                 value: 'None',                     src: CARD_BACK_IMAGE}, // Face down card
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
    const buttonStyle = {
      width: '100%', // Adjust the width as needed
      height: '100%', // Adjust the height as needed
      backgroundColor: 'white',
      margin: 0,
      padding: 0,
    };
  
    return (
      <div className="player-hand" style={{ display: 'flex', justifyContent: 'flex-start', padding: '0px',width: '45%', height: 'auto' }}>
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
              style={{ width: '100%', height: '100%' }} 
            />
          </Button>
        ))}
      </div>
    );
  };

  const tableCardsComponent = (_tableCards: Card[]) => {
    const buttonStyle = {
      width: '100%', // Adjust the width as needed
      height: '100%', // Adjust the height as needed
      backgroundColor: 'white',
      margin: 0,
      padding: 0,
    };
  
    return (
      <div className="player-hand" style={{ display: 'flex', justifyContent: 'flex-start', padding: '0px',width: '45%', height: 'auto' }}>
        <Image
          src={_tableCards[0].src}  
          alt={_tableCards[0].color} 
          style={{ width: '100%', height: '100%' }} 
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
            style={{ width: '100%', height: '100%' }} 
          />
          </Button>
      </div>
    );
  };

  const colorSquareComponent = () => {
    const colors = ['yellow', 'blue', 'red', 'green'];

    return (
      <div style={{ display: 'flex', flexDirection: 'column', position: 'relative', width: '200px', height: '200px' }}>
        <div style={{ flex: 1, display: 'flex' }}>
          <div style={{ flex: 1, backgroundColor: colors[0] }} onClick={() => gameAreaController.changeColor('Yellow')}></div>
          <div style={{ flex: 1, backgroundColor: colors[1] }} onClick={() => gameAreaController.changeColor('Blue')}></div>
        </div>
        <div style={{ flex: 1, display: 'flex' }}>
          <div style={{ flex: 1, backgroundColor: colors[2] }} onClick={() => gameAreaController.changeColor('Red')}></div>
          <div style={{ flex: 1, backgroundColor: colors[3] }} onClick={() => gameAreaController.changeColor('Green')}></div>
        </div>
      </div>
    );
  };

  const [otherPlayersHands] = useState<Array<UnoCard[]>>(new Array(3).fill(new Array(4).fill({ src: CARD_BACK_IMAGE })));
  const tableStyle: React.CSSProperties = {
    width: '90%',
    height: '325px',
    backgroundColor: 'red',
    borderRadius: '50%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
  };
  const deckStyle: React.CSSProperties = {
    position: 'absolute',
    top: '60%',
    left: '46%',
    transform: 'translate(-50%, -50%)', // This centers the deck
    zIndex: 1, // Ensures the deck is above the player hands
  };
  const playerHandStyle: React.CSSProperties = {
    position: 'absolute',
    // Adjust these values to position the player hands correctly
  };
  const leftHandStyle: React.CSSProperties = {
    position: 'absolute',
    top: '60%',
    left: '10%', // Adjust this value as needed
    transform: 'rotate(-90deg)', // Rotate the hand to align with the table's curve
  };

  const rightHandStyle: React.CSSProperties = {
    position: 'absolute',
    top: '60%',
    right: '19%', // Adjust this value as needed
    transform: 'rotate(90deg)', // Rotate the hand to align with the table's curve
  };
  const cardSize = '30px'; // For example, '50px' for smaller cards
    if (gameStatus === 'IN_PROGRESS') {
    return (
      <Flex direction="column" align="center" style={tableStyle}>
        <Flex style={deckStyle}>
        {
         justPlayedPlayerID === townController.ourPlayer.id &&
         colorChange ? 
         colorSquareComponent() : tableCardsComponent(tableCards)
        }
        </Flex>

        <Flex style={{...playerHandStyle, bottom: '10%'}} justify="center">
          {playerHandComponentButtons(ourHand)}
        </Flex>

        <Flex style={{...playerHandStyle, top: '35%'}} justify="center">
          {otherPlayersHands[0].map((card, cardIndex) => (
            <Image key={cardIndex} src={card.src} boxSize={cardSize}/>
          ))}
        </Flex>

        {/* Left hand */}
        <Flex style={leftHandStyle} justify="center" wrap="wrap">
          {otherPlayersHands[1].map((card, cardIndex) => (
            <Image key={cardIndex} src={card.src} boxSize={cardSize}/>
          ))}
        </Flex>

        {/* Right hand */}
        <Flex style={rightHandStyle} justify="center" wrap="wrap">
          {otherPlayersHands[2].map((card, cardIndex) => (
            <Image key={cardIndex} src={card.src} boxSize={cardSize}/>
          ))}
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
