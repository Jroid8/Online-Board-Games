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
    // joining doesn't happen when the player is absent
    // so using player.ws! should be safe
    const joinBroadcastMsg = Buffer.alloc(5);
    joinBroadcastMsg.writeUInt8(231);
    joinBroadcastMsg.writeUInt32BE(player.id, 1);
    for (const p of this.players) p.ws!.send(joinBroadcastMsg);
    const presentPlayersMsg = Buffer.alloc(2 + this.players.length * 4);
    presentPlayersMsg.writeUInt8(230);
    presentPlayersMsg.writeUInt8(this.players.length, 1);
    for (let i = 0; i < this.players.length; i++)
      presentPlayersMsg.writeUInt32BE(this.players[i].id, i * 4 + 2);
    player.ws!.send(presentPlayersMsg);
    this.players.push(player);
    player.room = this;
  }

  addPlayers(players: Player[]) {
    const presentPlayersMsg = Buffer.alloc(2 + players.length * 4);
    presentPlayersMsg.writeUInt8(230);
    presentPlayersMsg.writeUInt8(players.length, 1);
    for (let i = 0; i < players.length; i++)
      presentPlayersMsg.writeUInt32BE(players[i].id, i * 4 + 2);
		for (const p of players) {
			p.room = this;
			p.ws!.send(presentPlayersMsg);
		}
		this.players = players;
  }

  onDisconnect(player: Player, hub: Room) {
    setTimeout(
      () => {
        player.room = hub;
        for (let i = 0; i < this.players.length; i++)
          if (this.players[i].id == player.id) this.players.splice(i, 1);
      },
      1000 * 60 * 2.5, // make it configurable
    );
  }

  abstract onMessage(player: Player, message: Buffer): void;
}
