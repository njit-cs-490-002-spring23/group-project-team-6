import React, { useState }  from 'react';
import { Box, Image } from '@chakra-ui/react';
import { UnoCard } from '../../../classes/UnoCards';
import UnoCardComponent from './UnoCardComponent';

type UnoTableProps = {
  children?: React.ReactNode;
};

const BASE_PATH = '/assets/images/uno_assets_2d/PNGs/small';

// A helper function to create the initial deck
const createDeck = () => {
  return [
    { id: 1, color: 'blue', value: '0', imageUrl: `${BASE_PATH}/blue_0.png` },
    { id: 2, color: 'blue', value: '1', imageUrl: `${BASE_PATH}/blue_1.png` },
    // ... other cards
  ];
};

const unoTable: React.FC<UnoTableProps> = ({ children }) => {
  const [deck, setDeck] = useState(createDeck());
  const handleCardClick = (cardId) => {
    console.log(`Card clicked: ${cardId}`);
    // For example, you could filter out the clicked card to simulate playing it
    setDeck(prevDeck => prevDeck.filter(card => card.id !== cardId));
  };
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
  return (
    <Box style={tableStyle}>
      {/* Container for the cards */}
      <Box position="absolute" top="50%" left="50%" transform="translate(-50%, -50%)">
        {deck.map((card) => (
          <Image
            key={card.id}
            src={card.imageUrl}
            boxSize="100px"
            objectFit="cover"
            m="2"
            onClick={() => handleCardClick(card.id)}
            cursor="pointer"
          />
        ))}
      </Box>
    </Box>
  );
};

export default unoTable;
