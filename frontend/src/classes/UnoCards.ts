import { Card, Color, Value } from '../types/CoveyTownSocket';

export class UnoCard implements Card {
  color: Color;

  id: number;

  value: Value;

  src: string;

  constructor(id: number, color: Color, value: Value, src: string) {
    this.id = id;
    this.color = color;
    this.value = value;
    this.src = src;
  }

  canPlayOn(topCard: Card): boolean {
    // A card can be played if either the color or the value matches the top card on the play stack,
    // or if the card is a Wild card.
    return (
      this.color === topCard.color ||
      this.value === topCard.value ||
      this.color === 'Wild' ||
      topCard.color === 'Wild'
    );
  }

  play(): void {
    // Implement the functionality that should occur when the card is played.
    // This could involve changing the state of the game, applying the card's action (if it's an action card),
    // and so on. This method would be called when a player plays the card.
    console.log(`Playing ${this.color} ${this.value}`);
    // Additional game logic would go here.
  }
}
