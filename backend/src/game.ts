import { Player } from "./player";
import Room from "./room";

export interface GameInfo {
  id: number;
  playerCount: number;
  gameName: string;
}

// Classes extending this MUST HAVE GameInfo fields as static fields
// While typescript will prevent classes which don't do this from being included in gameList
// Problems will clearly arise once a sub class which doesn't abide by this rule is constructed outside of gameList
export abstract class GameRoom implements Room {
  players: Player[] = [];
  started: boolean = false;

  constructor(players?: Player[]) {
    if (players) {
      const gameStarted =
        this.players.length == (this as unknown as GameInfo).playerCount;
      const buffSize = 3 + (players.length - 1) * 4;
      for (const p of players) {
        const presentPlayersMsg = Buffer.alloc(buffSize);
        presentPlayersMsg.writeUInt8(230);
        presentPlayersMsg.writeUInt8(gameStarted ? 1 : 0, 1);
        presentPlayersMsg.writeUInt8(players.length - 1, 2);
        let i = 0;
        for (const o of players.filter((o) => p.id != o.id)) {
          presentPlayersMsg.writeUInt32BE(o.id, i * 4 + 3);
          i++;
        }
        p.room = this;
        // joining doesn't happen when the player is absent
        // so using player.ws! should be safe
        p.ws!.send(presentPlayersMsg);
      }
      this.players = players;
      if (gameStarted) this.begin(false);
    }
  }

  addPlayer(player: Player) {
    const joinBroadcastMsg = Buffer.alloc(5);
    joinBroadcastMsg.writeUInt8(231);
    joinBroadcastMsg.writeUInt32BE(player.id, 1);
    for (const p of this.players) p.ws!.send(joinBroadcastMsg);
    const presentPlayersMsg = Buffer.alloc(2 + this.players.length * 4);
    presentPlayersMsg.writeUInt8(230);
    presentPlayersMsg.writeUInt8(this.players.length, 1);
    for (let i = 0; i < this.players.length; i++)
      presentPlayersMsg.writeUInt32BE(this.players[i].id, i * 4 + 2);
    // same reason as above
    player.ws!.send(presentPlayersMsg);
    this.players.push(player);
    player.room = this;
    if (this.players.length == (this as unknown as GameInfo).playerCount)
      this.begin(true);
  }

  onDisconnect(player: Player, hub: Room) {
    let disconnectMsg = Buffer.alloc(5);
    disconnectMsg.writeUInt8(238);
    disconnectMsg.writeUInt32BE(player.id);
    if (this.started)
      setTimeout(
        () => {
          for (const p of this.players) {
            if (p.ws) p.ws.send(disconnectMsg);
            p.room = hub;
          }
          this.players = [];
        },
        1000 * 60 * 2.5,
      );
    else {
      this.players = this.players.filter((p) => p.id != player.id);
      player.room = hub;
      for (const p of this.players) p.ws!.send(disconnectMsg);
    }
  }

  begin(inform: boolean) {
    this.started = true;
    if (inform)
      for (const p of this.players) if (p.ws) p.ws.send(Buffer.from([232]));
  }

  abstract onMessage(player: Player, message: Buffer): void;
}
