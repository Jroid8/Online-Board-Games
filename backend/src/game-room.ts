import GameInfo from "./game-info";
import { Player } from "./player";
import Room from "./room";

export const gameMsgCodes = Object.freeze({
  joinedRoom: 0xc0,
  otherPlayerJoinedRoom: 0xc1,
  otherPlayerDisconnected: 0xc3,
  gameStarted: 0xc2,
  gameConcluded: 0xc8,
});

// Classes extending this MUST HAVE GameInfo fields as static fields
// While typescript will prevent classes which don't do this from being included in gameList
// Problems will clearly arise once a sub class which doesn't abide by this rule is constructed outside of gameList
export abstract class GameRoom implements Room {
  protected players: Player[] = [];
  protected playerIndex: Map<number, number> = new Map();
  protected roomID: bigint;
  private forfeitTimeouts: Map<number, NodeJS.Timeout> = new Map();

  protected broadcastMessage(message: Buffer, excludePlayer?: Player) {
    for (const p of this.players) {
      if (p.ws && p.id !== excludePlayer?.id) {
        p.ws.send(message);
      }
    }
  }

  private staticFields(): GameInfo {
    return this.constructor as unknown as GameInfo;
  }

  protected serializePlayerIDs(excludePlayer?: Player): Buffer {
    const exNum = excludePlayer ? 1 : 0;
    const buff = Buffer.alloc(1 + (this.players.length - exNum) * 4);
    let j = 0;
    buff.writeUInt8(this.players.length - exNum);
    for (const p of this.players) {
      if (p.id === excludePlayer?.id) continue;
      buff.writeUInt32BE(p.id, j * 4 + 3);
      j++;
    }
    return buff;
  }

  public isGameStarted(): boolean {
    return this.players.length >= this.staticFields().playerCount;
  }

  private sendFullJoinMsg(player: Player) {
    player.ws!.send(
      Buffer.concat([
        Buffer.from([gameMsgCodes.joinedRoom]),
        Buffer.from(new BigUint64Array([this.roomID])),
        Buffer.from([this.isGameStarted() ? 1 : 0]),
        this.serializePlayerIDs(player),
        this.isGameStarted() ? this.serializeState() : Buffer.alloc(0),
      ]),
    );
  }

  private informPlayerJoin(player: Player) {
    const joinBroadcastMsg = Buffer.alloc(5);
    joinBroadcastMsg.writeUInt8(gameMsgCodes.otherPlayerJoinedRoom);
    joinBroadcastMsg.writeUInt32BE(player.id, 1);
    this.broadcastMessage(joinBroadcastMsg, player);
  }

  private initPlayerIndex() {
    for (let i = 0; i < this.staticFields().playerCount; i++)
      this.playerIndex.set(this.players[i].id, i);
  }

  private startGameIfCan() {
    if (this.players.length == this.staticFields().playerCount) {
      this.initPlayerIndex();
      this.broadcastMessage(
        Buffer.concat([Buffer.from([gameMsgCodes.gameStarted]), this.begin()]),
      );
    }
  }

  protected isSpectator(player: Player) {
    return this.playerIndex.get(player.id) !== undefined;
  }

  public constructor(players: Player[]) {
    this.roomID = BigInt(Date.now());
    this.players = players;
    for (const p of this.players) {
      p.room = this;
      this.sendFullJoinMsg(p);
    }
    if (this.isGameStarted()) this.initPlayerIndex();
  }

  public register(player: Player) {
    this.informPlayerJoin(player);
    this.sendFullJoinMsg(player);
    this.players.push(player);
    player.room = this;
    this.startGameIfCan();
  }

  public onDisconnect(player: Player) {
    let disconnectMsg = Buffer.alloc(5);
    disconnectMsg.writeUInt8(gameMsgCodes.otherPlayerDisconnected);
    disconnectMsg.writeUInt32BE(player.id, 1);
    if (this.isGameStarted() && this.playerIndex.get(player.id) !== undefined) {
      this.forfeitTimeouts.set(
        player.id,
        setTimeout(
          () => {
            this.broadcastMessage(Buffer.from([gameMsgCodes.gameConcluded]));
            for (const p of this.players) p.room = globalThis.hub;
            this.players = [];
          },
          1000 * 60 * 2.5,
        ),
      );
    } else {
      this.players = this.players.filter((p) => p.id != player.id);
      player.room = globalThis.hub;
    }
    this.broadcastMessage(disconnectMsg);
  }

  public onRejoin(player: Player): void {
    clearTimeout(this.forfeitTimeouts.get(player.id));
    this.informPlayerJoin(player);
    this.sendFullJoinMsg(player);
  }

  public onChat(player: Player, message: Buffer): void {
		message.writeUInt32BE(player.id, 1);
		this.broadcastMessage(message, player);
	}

  abstract onMessage(player: Player, message: Buffer): void;
  abstract begin(): Buffer;
  abstract serializeState(): Buffer;
}
