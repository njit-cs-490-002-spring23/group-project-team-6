import { ConversationArea, Interactable, UnoGameState, ViewingArea, GameArea } from './CoveyTownSocket';

/**
 * Test to see if an interactable is a conversation area
 */
export function isConversationArea(interactable: Interactable): interactable is ConversationArea {
  return interactable.type === 'ConversationArea';
}

/**
 * Test to see if an interactable is a viewing area
 */
export function isViewingArea(interactable: Interactable): interactable is ViewingArea {
  return interactable.type === 'ViewingArea';
}

/**
 * Test to see if an interactable is an Uno area
 */
export function isUnoArea(interactable: Interactable,): interactable is GameArea<UnoGameState> {
  return interactable.type === 'UnoArea';
}
