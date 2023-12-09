// UnoCardComponent.jsx
import React from 'react';
import { UnoCard } from '../../../classes/UnoCards';

type UnoCardComponentProps = {
  card: UnoCard;
};

const unoCardComponent: React.FC<UnoCardComponentProps> = ({ card }) => {
  // Visual representation of a card
  return (
    <div>
      {card.color} {card.value}
    </div>
  );
};

export default unoCardComponent;
