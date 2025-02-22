import { GameRoom } from "../game";
import { Player } from "../player";

export default class TicTacToe extends GameRoom {
  onMessage(player: Player, message: Buffer): void {}
}
