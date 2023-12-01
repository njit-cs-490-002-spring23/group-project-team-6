import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Button,
  Container,
  Heading,
  List,
  ListItem,
  Modal,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  useToast,
} from '@chakra-ui/react';
import React, { useCallback, useEffect, useState } from 'react';
import UnoAreaController from '../../../classes/UnoAreaController';
import PlayerController from '../../../classes/PlayerController';
import { useInteractable, use } from '../../../classes/TownController';
import { GameStatus, Interactable } from '../../../types/CoveyTownSocket';

// Mock data
// const initialGameState = {
//   players: [
//     { id: 1, name: 'Player 1', cards: [] },
//     { id: 2, name: 'Player 2', cards: [] }
//   ],
//   currentPlayerId: 1,
//   deck: [],
//   pile: [],
//   timer: 150 // Assuming timer starts at 2 minutes 30 seconds
// };

// // Sub-component: PlayerArea
// const PlayerArea = ({ player, isCurrentPlayer }) => {
//   return (
//     <div className={`player-area ${isCurrentPlayer ? 'current' : ''}`}>
//       <h2>{player.name}</h2>
//       {/* Display player's cards here */}
//       <div className="cards">
//         {player.cards.map(card => (
//           <div key={card.id} className="card">
//             {/* Render card details */}
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// // Sub-component: Timer
// const Timer = ({ timeLeft }) => {
//   const minutes = Math.floor(timeLeft / 60);
//   const seconds = timeLeft % 60;
//   return (
//     <div className="timer">
//       {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
//     </div>
//   );
// };

// // Sub-component: TurnIndicator
// const TurnIndicator = ({ currentPlayerId }) => {
//   return (
//     <div className="turn-indicator">
//       {currentPlayerId}'s turn
//     </div>
//   );
// };

// // Main component: UnoGame
// const UnoGame = () => {
//   const [gameState, setGameState] = useState(initialGameState);

//   // Timer logic
//   useEffect(() => {
//     const timerId = setInterval(() => {
//       setGameState(prevState => ({
//         ...prevState,
//         timer: prevState.timer - 1
//       }));
//     }, 1000);

//     return () => clearInterval(timerId);
//   }, []);

//   // Update current player
//   const handleTurnEnd = () => {
//     // Logic to change current player and game state
//   };

//   return (
//     <div className="uno-game">
//       <div className="player-areas">
//         {gameState.players.map(player => (
//           <PlayerArea
//             key={player.id}
//             player={player}
//             isCurrentPlayer={player.id === gameState.currentPlayerId}
//           />
//         ))}
//       </div>
//       <Timer timeLeft={gameState.timer} />
//       <TurnIndicator currentPlayerId={gameState.currentPlayerId} />
//       {/* More game logic and components */}
//     </div>
//   );
// };

// export default UnoGame;

  // /**
  //  * The UnoArea component renders the Uno game area.
  //  * ... similar documentation as TicTacToeArea ...
  //  */
  // function UnoArea({ interactableID }: { interactableID: InteractableID }): JSX.Element {
  //   const gameAreaController = useInteractable<UnoAreaController>(interactableID);
  //   const townController = useTownController();
  
  //   // ... similar useState hooks for Uno game state ...
    
  //   const toast = useToast();
  
  //   // ... similar useEffect hook for Uno game state updates ...
  
  //   let gameStatusText = <></>;
  //   // ... similar game status text logic ...
  
  //   return (
  //     <Container>
  //       <Heading as='h2'>Uno Game</Heading>
  //       {gameStatusText}
  //       <List aria-label='list of players in the game'>
  //         {/* 
  //           Render players' usernames. You would need to adjust this for the Uno game logic.
  //           You might have more than two players, and you might want to show their card counts.
  //         */}
  //         <ListItem>Player 1: {player1?.userName || '(No player yet!)'}</ListItem>
  //         <ListItem>Player 2: {player2?.userName || '(No player yet!)'}</ListItem>
  //       </List>
  //       <UnoBoard gameAreaController={gameAreaController} />
  //       {/* ... other components as needed ... */}
  //     </Container>
  //   );
  // }
  
  // export default UnoArea;