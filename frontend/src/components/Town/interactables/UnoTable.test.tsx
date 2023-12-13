import React from 'react';
import { render, screen } from '@testing-library/react';
import UnoTable from './unoTable';


jest.mock('../../../classes/TownController');
jest.mock('../../../hooks/useTownController');
jest.mock('../../../classes/UnoAreaController');

describe('UnoTable Component', () => {
  it('renders without errors', () => {
    render(<UnoTable interactableID="testInteractableID" readyPlayerIDs={['player1', 'player2']} />);
    
  });

  it('displays the player components correctly', () => {
    
    const players = [{ id: 'p1', userName: 'Player 1' }, { id: 'p2', userName: 'Player 2' }];
    
    const gameAreaController = {
      status: 'IN_PROGRESS',
      players,
      
    };
    render(<UnoTable interactableID="testInteractableID"  readyPlayerIDs={['p1','p2']}/>);
    
  });

  it('handles the "Ready Up" button click correctly', async () => {
    
    const mockReadyUp = jest.fn();
    const gameAreaController = {
      status: 'WAITING_TO_START',
      readyUp: mockReadyUp,
      
    };
    render(<UnoTable interactableID="testInteractableID" />);
    
    const readyButton = screen.getByText('Ready Up');
    expect(readyButton).toBeInTheDocument();
    await screen.click(readyButton);
    
    expect(mockReadyUp).toHaveBeenCalled();
  });

  it('handles the "Deal Cards" button click correctly', async () => {
    
    const mockDealCards = jest.fn();
    const gameAreaController = {
      status: 'WAITING_TO_START',
      dealCards: mockDealCards,
      
    };
    render(<UnoTable interactableID="testInteractableID" />);
    
    const dealCardsButton = screen.getByText('Deal Cards');
    expect(dealCardsButton).toBeInTheDocument();
    await screen.click(dealCardsButton);
    
    expect(mockDealCards).toHaveBeenCalled();
  });

  it('handles the "Deal Cards" button click correctly', async () => {
    const mockDealCards = jest.fn();
    const gameAreaController = { status: 'WAITING_TO_START', dealCards: mockDealCards };
    renderUnoTable(gameAreaController);

    const dealCardsButton = screen.getByText('Deal Cards');
    expect(dealCardsButton).toBeInTheDocument();
    fireEvent.click(dealCardsButton);

    await waitFor(() => {
      expect(mockDealCards).toHaveBeenCalled();
    });
  });
  
});