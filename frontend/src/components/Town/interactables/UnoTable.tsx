import React, { useState }  from 'react';
import { Box } from '@chakra-ui/react';
import { UnoCard } from '../../../classes/UnoCards';
import UnoCardComponent from './UnoCardComponent';

type UnoTableProps = {
  children?: React.ReactNode;
};

const unoTable: React.FC<UnoTableProps> = ({ children }) => {
  const [deck, setDeck] = useState<UnoCard[]>([
    new UnoCard('Red', '5'),
    new UnoCard('Green', 'Skip'),
    // ... other cards
  ]);
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
  return <Box style={tableStyle}>
  {/* Map over the deck and render each UnoCard */}
  {deck.map((card, index) => (
    <UnoCardComponent key={index} card={card} />
  ))}
</Box>
};

export default unoTable;
