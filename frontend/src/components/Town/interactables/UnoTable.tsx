import React, { useState }  from 'react';
import { Box, Image, Flex } from '@chakra-ui/react';
import { UnoCard } from '../../../classes/UnoCards';
import UnoCardComponent from './UnoCardComponent';

type UnoTableProps = {
  children?: React.ReactNode;
};

const BASE_PATH = '/assets/images/uno_assets_2d/PNGs/small';
const CARD_BACK_IMAGE = '/assets/images/uno_assets_2d/PNGs/small/card_back.png';
// A helper function to create the initial deck
const createDeck = () => {
  return [
    { id: 1, color: 'blue', value: '0', src: `${BASE_PATH}/blue_0.png` },
    { id: 2, color: 'green', value: '9', src: `${BASE_PATH}/green_9.png` },
    { id: 3, color: 'red', value: '7', src: `${BASE_PATH}/red_7.png` },
    { id: 4, color: 'yellow', value: '2', src: `${BASE_PATH}/yellow_2.png` },
  ];
};

const unoTable: React.FC<UnoTableProps> = ({ children }) => {
  const [playerHand, setPlayerHand] = useState<UnoCard[]>([
    { id: 1, color: 'Red', value: '0', src: `${BASE_PATH}/red_0.png`, canPlayOn: (topCard) => {
      // Implement logic here...
      return false;
    },
    play: () => {
      // Implement logic here...
    }},
    { id: 2, color: 'Green', value: '1', src: `${BASE_PATH}/green_1.png`, canPlayOn: (topCard) => {
      // Implement logic here...
      return false;
    },
    play: () => {
      // Implement logic here...
    }},
    { id: 3, color: 'Yellow', value: '2', src: `${BASE_PATH}/yellow_2.png`, canPlayOn: (topCard) => {
      // Implement logic here...
      return false;
    },
    play: () => {
      // Implement logic here...
    }},
    { id: 4, color: 'Blue', value: '3', src: `${BASE_PATH}/blue_3.png`, canPlayOn: (topCard) => {
      // Implement logic here...
      return false;
    },
    play: () => {
      // Implement logic here...
    }},
  ]);
  const [tableCards, setTableCards] = useState<UnoCard[]>([
    { id: 5, color: 'Blue', value: '4', src: `${BASE_PATH}/blue_4.png`, canPlayOn: (topCard) => {
      // Implement logic here...
      return false;
    },
    play: () => {
      // Implement logic here...
    }}, // Face up card
    { id: 6, color: 'None', value: '4', src: CARD_BACK_IMAGE, canPlayOn: (topCard) => {
      // Implement logic here...
      return false;
    },
    play: () => {
      // Implement logic here...
    }}, // Face down card
  ]);
  const [otherPlayersHands] = useState<Array<UnoCard[]>>(new Array(3).fill(new Array(4).fill({ src: CARD_BACK_IMAGE })));
  const [deck, setDeck] = useState(createDeck());
  const tableStyle: React.CSSProperties = {
    width: '600px',
    height: '300px',
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
    top: '52%',
    left: '43%',
    transform: 'translate(-50%, -50%)', // This centers the deck
    zIndex: 1, // Ensures the deck is above the player hands
  };
  const playerHandStyle: React.CSSProperties = {
    position: 'absolute',
    // Adjust these values to position the player hands correctly
  };
  const topHandStyle: React.CSSProperties = {
    position: 'absolute',
  };

  const leftHandStyle: React.CSSProperties = {
    position: 'absolute',
    top: '50%',
    left: '22%', // Adjust this value as needed
    transform: 'rotate(-90deg)', // Rotate the hand to align with the table's curve
  };

  const rightHandStyle: React.CSSProperties = {
    position: 'absolute',
    top: '50%',
    right: '35%', // Adjust this value as needed
    transform: 'rotate(90deg)', // Rotate the hand to align with the table's curve
  };
  const cardSize = '30px'; // For example, '50px' for smaller cards

  return (
    <Flex direction="column" align="center" style={tableStyle}>
      <Flex style={deckStyle}>
        <Image src={tableCards[0].src} boxSize={cardSize}/>
        <Image src={tableCards[1].src} boxSize={cardSize}/>
      </Flex>

      <Flex style={{...playerHandStyle, bottom: '25%'}} justify="center">
        {playerHand.map((card) => (
          <Image key={card.id} src={card.src} boxSize={cardSize}/>
        ))}
      </Flex>

      <Flex style={{...playerHandStyle, top: '32%'}} justify="center">
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
};

export default unoTable;
