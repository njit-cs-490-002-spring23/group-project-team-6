// UnoCardComponent.test.jsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import UnoCardComponent from './UnoCardComponent'; // Adjust the import path as needed
import { UnoCard } from '../../../classes/UnoCards'; // Adjust the import path for UnoCard
import { Card } from '../../../types/CoveyTownSocket';

const someCard : Card = { color:'Blue', value:'5', src:'somePath'}
describe('UnoCardComponent', () => {
    const cardData: UnoCard = {
        color: 'Red',
        value: '5',
        src:"SomePath",
        id: 13,
        canPlayOn(),
        play()
      };
  it('renders card with correct color and value', () => {

    const { getByText } = render(<UnoCardComponent card={cardData} />);
    expect(getByText(cardData.color)).toBeInTheDocument();
    expect(getByText(cardData.value)).toBeInTheDocument();
  });
});
