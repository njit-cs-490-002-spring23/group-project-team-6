import React from 'react';
import { Box, Text, VStack } from '@chakra-ui/react';

type TurnIndicatorProps = {
  currentTurn: string;
};

const turnIndicator: React.FC<TurnIndicatorProps> = ({ currentTurn }) => {
  return (
    <VStack
      spacing={4}
      align='stretch'
      bg='orange.100'
      p={5}
      borderRadius='md'
      boxShadow='0 4px 12px rgba(0, 0, 0, 0.2)'
      minW='200px'
      h='fit-content'
    >
      <Text fontSize='xl' fontWeight='bold' color='orange.800'>
        Current Turn
      </Text>
      <Box
        p={4}
        bg='white'
        borderRadius='md'
        border='1px solid'
        borderColor='orange.200'
      >
        <Text fontSize='lg' fontWeight='semibold' color='gray.700'>
          {currentTurn}
        </Text>
      </Box>
    </VStack>
  );
};

export default turnIndicator;
