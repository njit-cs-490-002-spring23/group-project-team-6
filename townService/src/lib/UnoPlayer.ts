import Player from './Player';
import { PlayerLocation, TownEmitter, Card } from '../types/CoveyTownSocket';
export default class UnoPlayer {
  public readonly _player: Player;
  public playerToLeft?: UnoPlayer | null;
  public playerToRight?: UnoPlayer | null;
  public cardsInHand?: Card[];
  public readyUp?: boolean | null;
  constructor(player: Player) {
    this._player = player;
    this.playerToLeft = null;
    this.playerToRight = null;
    this.cardsInHand = [];
    this.readyUp = false;
  }
  // Getter methods for Player properties
  get userName(): string {
    return this._player.userName;
  }

  get id(): string {
    return this._player.id;
  }

  get location(): PlayerLocation {
    return this._player.location;
  }

  get videoToken(): string | undefined {
    return this._player.videoToken;
  }

  get sessionToken(): string {
    return this._player.sessionToken;
  }

  get townEmitter(): TownEmitter {
    return this._player.townEmitter;
  }
}
  