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
// A helper function to create the initial deck
const createDeck = () => {
  return [
    { id: 1, color: 'blue', value: '0', src: `${BASE_PATH}/blue_0.png` },
    { id: 2, color: 'green', value: '9', src: `${BASE_PATH}/green_9.png` },
    { id: 3, color: 'red', value: '7', src: `${BASE_PATH}/red_7.png` },
    { id: 4, color: 'yellow', value: '2', src: `${BASE_PATH}/yellow_2.png` },
  ];
};


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
    };
    gameAreaController.addListener('gameUpdated', updateGameState);
    return () => {
      gameAreaController.removeListener('gameUpdated', updateGameState);
    };
  }, [townController, gameAreaController, toast]);

  const playerHandComponentButtons = (listOfCards: Card[]) => {
    const imageStyle = {
      width: '100%', // Adjust the width as needed
      height: '100%', // Adjust the height as needed
      backgroundColor: 'red',
    };
  
    return (
      <div className="player-hand" style={{ display: 'flex', justifyContent: 'space-evenly', padding: '0px',width: '45%', height: 'auto' }}>
        {listOfCards.map((card : Card) => (
          <Button
            key={card.src}
            style={imageStyle} 
            className="card-button" 
            onClick={async () => {
              const move: UnoMove = {cardPlaced: card};
              try { 
                await gameAreaController.makeMove(move);
              } catch (e) {
                toast ({
                  title: "Not Working D:",
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

  const playerHandComponent = (listOfCards: Card[]) => {
    const imageStyle = {
      width: '90%', // Adjust the width as needed
      height: '90%', // Adjust the height as needed
    };
  
    return (
      <div className="player-hand" style={{ display: 'flex', justifyContent: 'space-around', padding: '1px',width: '50%', height: 'auto' }}>
        {listOfCards.map((card : Card) => (
          <Image
            key={card.src}
            src={card.src}  
            alt={card.color} 
            style={imageStyle} 
            ></Image>
        ))}
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
    if (gameStatus === 'IN_PROGRESS' && isOurTurn) {
    return (
      <Flex direction="column" align="center" style={tableStyle}>
        <Flex style={deckStyle}>
          {playerHandComponent(tableCards)};
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
  else if (gameStatus === 'IN_PROGRESS' && !isOurTurn){
    return (
      <Flex direction="column" align="center" style={tableStyle}>
        <Flex style={deckStyle}>
          {playerHandComponent(tableCards)};
        </Flex>

        <Flex style={{...playerHandStyle, bottom: '10%'}} justify="center">
          {playerHandComponent(ourHand)}
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
