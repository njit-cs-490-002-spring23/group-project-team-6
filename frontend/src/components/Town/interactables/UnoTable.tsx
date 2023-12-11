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

  const calculatePlayerPosition = (index: number, ourPlayerIndex: number, totalPlayers: number) => {
    const relativeIndex = ((index - ourPlayerIndex + totalPlayers) % totalPlayers);
    const angle = (2 * Math.PI) / totalPlayers;
    const radius = 20; // Adjust this value as needed
    const x = 42.5 + radius * 1.5 * Math.sin(angle * relativeIndex);
    const y = 55 + radius * Math.cos(angle * relativeIndex);
    return { left: `${x}%`, top: `${y}%`,width: 'auto', height: 'auto',backgroundColor: 'transparent'};
  };

  const ourPlayerIndex = players.findIndex(player => player.id === townController.ourPlayer.id);

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
        <Flex>
        {playerComponents}
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
