import { Player } from "./player";
import Room from "./room";

export interface GameInfo {
  id: number;
  playerCount: number;
  gameName: string;
  roomImpl: new () => GameRoom;
}

export abstract class GameRoom implements Room {
  players: Player[] = [];

  addPlayer(player: Player) {
    this.players.push(player);
    player.room = this;
    // joining doesn't happen when the player is absent, so this should be safe
    player.ws!.send(Buffer.from([230]));
  }

  addPlayers(players: Player[]) {
    for (const p of players) this.addPlayer(p);
  }

  onDisconnect(player: Player) {
    setTimeout(
      () => {
        for (let i = 0; i < this.players.length; i++)
          if (this.players[i].id == player.id) this.players.splice(i, 1);
      },
      1000 * 60 * 2.5, // make it configurable
    );
  }

  abstract onMessage(player: Player, message: Buffer): void;
}
