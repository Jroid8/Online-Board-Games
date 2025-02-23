import GameInfo from "./game-info";
import { Player } from "./player";
import Room from "./room";

// Classes extending this MUST HAVE GameInfo fields as static fields
// While typescript will prevent classes which don't do this from being included in gameList
// Problems will clearly arise once a sub class which doesn't abide by this rule is constructed outside of gameList
export default abstract class GameRoom implements Room {
  players: Player[] = [];
  started: boolean = false;
  forfeitTimeouts: Map<number, NodeJS.Timeout> = new Map();

  constructor(players?: Player[]) {
    if (players) {
      const gameStarted =
        this.players.length == (this as unknown as GameInfo).playerCount;
      const buffSize = 3 + (players.length - 1) * 4;
      const gameInitMsg = this.begin();
      for (let i = 0; i < players.length; i++) {
        const generalStateMsg = Buffer.alloc(buffSize);
        generalStateMsg.writeUInt8(230);
        generalStateMsg.writeUInt8(gameStarted ? 1 : 0, 1);
        generalStateMsg.writeUInt8(players.length - 1, 2);
        let i = 0;
        for (const p of players) {
          if (p.id == players[i].id) continue;
          generalStateMsg.writeUInt32BE(p.id, i * 4 + 3);
          i++;
        }
        players[i].room = this;
        // joining doesn't happen when the player is absent
        // so using player.ws! should be safe
        players[i].ws!.send(Buffer.concat([generalStateMsg, gameInitMsg[i]]));
      }
      this.players = players;
    }
  }

  informPlayerJoin(player: Player) {
    const joinBroadcastMsg = Buffer.alloc(5);
    joinBroadcastMsg.writeUInt8(231);
    joinBroadcastMsg.writeUInt32BE(player.id, 1);
    for (const p of this.players)
      if (p.ws && p.id != player.id) p.ws.send(joinBroadcastMsg);
  }

  addPlayer(player: Player) {
    this.informPlayerJoin(player);
    const presentPlayersMsg = Buffer.alloc(2 + this.players.length * 4);
    presentPlayersMsg.writeUInt8(230);
    presentPlayersMsg.writeUInt8(this.players.length, 1);
    for (let i = 0; i < this.players.length; i++)
      presentPlayersMsg.writeUInt32BE(this.players[i].id, i * 4 + 2);
    // same reason as above
    player.ws!.send(presentPlayersMsg);
    this.players.push(player);
    player.room = this;
    if (this.players.length == (this as unknown as GameInfo).playerCount) {
      const initMsg = this.begin();
      for (let i = 0; i < this.players.length; i++)
        this.players[i].ws!.send(
          Buffer.concat([Buffer.from([232]), initMsg[i]]),
        );
    }
  }

  onDisconnect(player: Player, hub: Room) {
    let disconnectMsg = Buffer.alloc(5);
    disconnectMsg.writeUInt8(233);
    disconnectMsg.writeUInt32BE(player.id);
    let notThisPlayer = this.players.filter((p) => p.id != player.id);
    if (this.started) {
      for (const p of notThisPlayer) if (p.ws) p.ws.send(disconnectMsg);
      this.forfeitTimeouts.set(
        player.id,
        setTimeout(
          () => {
            for (const p of notThisPlayer) {
              if (p.ws) p.ws.send(Buffer.from([238]));
              p.room = hub;
            }
            this.players = [];
          },
          1000 * 60 * 2.5,
        ),
      );
    } else {
      this.players = notThisPlayer;
      player.room = hub;
      for (const p of this.players) p.ws!.send(disconnectMsg);
    }
  }

  onRejoin(player: Player): void {
    clearTimeout(this.forfeitTimeouts.get(player.id));
    this.informPlayerJoin(player);
  }

  abstract onMessage(player: Player, message: Buffer): void;
  abstract begin(): Buffer[];
}
