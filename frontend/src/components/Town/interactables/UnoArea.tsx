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
    Flex
  } from '@chakra-ui/react';
  import React, { useCallback, useEffect, useState } from 'react';
  import UnoTable from './UnoTable';
  import TurnIndicator from './TurnIndicator';
  import UnoAreaController from '../../../classes/UnoAreaController';
  import PlayerController from '../../../classes/PlayerController';
  import { useInteractable, useInteractableAreaController } from '../../../classes/TownController';
  import useTownController from '../../../hooks/useTownController';
  import { GameResult, GameStatus, InteractableID } from '../../../types/CoveyTownSocket';
  import GameAreaInteractable from './GameArea';
  import { UnoCard as UnoCardModel, Color, Value } from '../../../types/CoveyTownSocket';
  import UnoCardComponent from '../../../classes/UnoCards';
  
  /**
   * The UnoArea component renders the Uno game area.
   * It renders the current state of the area, optionally allowing the player to join the game.
   *
   * It uses Chakra-UI components (does not use other GUI widgets)
   *
   * It uses the UnoAreaController to get the current state of the game.
   * It listens for the 'gameUpdated' and 'gameEnd' events on the controller, and re-renders accordingly.
   * It subscribes to these events when the component mounts, and unsubscribes when the component unmounts. It also unsubscribes when the gameAreaController changes.
   *
   * It renders the following:
   * - A list of players' usernames (in a list with the aria-label 'list of players in the game', one item for X and one for O)
   *    - If there is no player in the game, the username is '(No player yet!)'
   * - A message indicating the current game status:
   *    - If the game is in progress, the message is 'Game in progress, currently {whoseTurn}'s turn'. If it is currently our player's turn, the message is 'Game in progress, currently your turn'
   *    - Otherwise the message is 'Game {not yet started | over}.'
   * - If the game is in status WAITING_TO_START or OVER, a button to join the game is displayed, with the text 'Join New Game'
   *    - Clicking the button calls the joinGame method on the gameAreaController
   *    - Before calling joinGame method, the button is disabled and has the property isLoading set to true, and is re-enabled when the method call completes
   *    - If the method call fails, a toast is displayed with the error message as the description of the toast (and status 'error')
   *    - Once the player joins the game, the button dissapears
   *
   * - When the game ends, a toast is displayed with the result of the game:
   *    - Our player won: description 'You won!'
   *    - Our player lost: description 'You lost :('
   *
   */
  function UnoArea({ interactableID }: { interactableID: InteractableID }): JSX.Element {
    const gameAreaController = useInteractableAreaController<UnoAreaController>(interactableID);
    const townController = useTownController();
    const [gameStatus, setGameStatus] = useState<GameStatus>(gameAreaController.status);
    const [observers, setObservers] = useState<PlayerController[]>(gameAreaController.observers);
    const [joiningGame, setJoiningGame] = useState(false);
    const toast = useToast();    
      useEffect(() => {
      const updateGameState = () => {
        setGameStatus(gameAreaController.status || 'WAITING_TO_START');
        setObservers(gameAreaController.observers);
      };
      gameAreaController.addListener('gameUpdated', updateGameState);
      const onGameEnd = () => {
        const winner = gameAreaController.winner;
        if (!winner) {
          toast({
            title: 'Game over',
            description: 'No Winner',
            status: 'info',
          });
        } else if (winner === townController.ourPlayer) {
          toast({
            title: 'Game over',
            description: 'You won!',
            status: 'success',
          });
        } else {
          toast({
            title: 'Game over',
            description: `You lost :(`,
            status: 'error',
          });
        }
      };
      gameAreaController.addListener('gameEnd', onGameEnd);
      return () => {
        gameAreaController.removeListener('gameEnd', onGameEnd);
        gameAreaController.removeListener('gameUpdated', updateGameState);
      };
    }, [townController, gameAreaController, toast]);
  
    let gameStatusText = <></>;
    if (gameStatus === 'IN_PROGRESS') {
      gameStatusText = (
        <>
          {gameAreaController.whoseTurn === townController.ourPlayer
            ? 'your'
            : gameAreaController.whoseTurn?.userName + "'s"}{' '}
          turn
        </>
      );
    } else {
      let joinGameButton = <></>;
      if (
        (gameAreaController.status === 'WAITING_TO_START' && !gameAreaController.isPlayer) ||
        gameAreaController.status === 'OVER'
      ) {
        joinGameButton = (
          <Button
            onClick={async () => {
              setJoiningGame(true);
              try {
                await gameAreaController.joinGame();  
              } catch (err) {
                toast({
                  title: 'Error joining game',
                  description: (err as Error).toString(),
                  status: 'error',
                });
              }
              setJoiningGame(false);
            }}
            isLoading={joiningGame}
            disabled={joiningGame}>
            Join New Game
          </Button>
        );
      }
      gameStatusText = (
        <b>
          Game {gameStatus === 'WAITING_TO_START' ? 'not yet started' : 'over'}. {joinGameButton}
        </b>
      );
    }
  
    return (
      <Container maxWidth="80vw">
        <Accordion allowToggle>
          <AccordionItem>
            <Heading as='h3'>
              <AccordionButton>
                <Box as='span' flex='1' textAlign='left'>
                  Leaderboard
                  <AccordionIcon />
                </Box>
              </AccordionButton>
            </Heading>
          </AccordionItem>
          <AccordionItem>
            <Heading as='h3'>
              <AccordionButton>
                <Box as='span' flex='1' textAlign='left'>
                  Current Observers
                  <AccordionIcon />
                </Box>
              </AccordionButton>
            </Heading>
            <AccordionPanel>
              <List aria-label='list of observers in the game'>
                {observers.map(player => {
                  return <ListItem key={player.id}>{player.userName}</ListItem>;
                })}
              </List>
            </AccordionPanel>
          </AccordionItem>
        </Accordion>
        {gameStatusText}
        <List aria-label='list of players in the game'>
        </List>
        <Flex direction='row' justify='center' align='center' width='80vw' mx='auto' marginTop='2rem' gap={5}>
          <UnoTable />
          <TurnIndicator currentTurn="Player's Name" />
        </Flex>
      </Container>
    );
  }
  
  /**
   * A wrapper component for the UnoArea component.
   * Determines if the player is currently in a Uno area on the map, and if so,
   * renders the UnoArea component in a modal.
   *
   */
  export default function UnoAreaWrapper(): JSX.Element {
    const gameArea = useInteractable<GameAreaInteractable>('gameArea');
    const townController = useTownController();
    const closeModal = useCallback(() => {
      if (gameArea) {
        townController.interactEnd(gameArea);
        const controller = townController.getGameAreaController(gameArea);
        controller.leaveGame();
      }
    }, [townController, gameArea]);
  
    if (gameArea && gameArea.getData('type') === 'Uno') {
      return (
        <Modal isOpen={true} onClose={closeModal} closeOnOverlayClick={false}>
          <ModalOverlay />
          <ModalContent marginTop='1.5rem' marginBottom='1.5rem' maxWidth="90vw" height="90vh">
            <ModalHeader>{gameArea.name}</ModalHeader>
            <ModalCloseButton />
            <UnoArea interactableID={gameArea.name} />
          </ModalContent>
        </Modal>
      );
    }
    return <></>;
  }
  