import log from "loglevel";
import GameInfo from "./game-info";
import { Player } from "./player";
import Room from "./room";

export const gameMsgCodes = Object.freeze({
	joinedRoom: 0xc0,
	leftRoom: 0xc3,
	otherPlayerJoinedRoom: 0xc1,
	otherPlayerDisconnected: 0xc3,
	gameStarted: 0xc2,
	gameConcluded: 0xc8,
	playerTurn: 0xd0,
});

// Classes extending this MUST HAVE GameInfo fields as static fields
// While typescript will prevent classes which don't do this from being included in gameList
// Problems will clearly arise once a sub class which doesn't abide by this rule is constructed outside of gameList
export abstract class GameRoom implements Room {
	protected players: Player[] = [];
	protected turn: number = 0;
	protected playerIndex: Map<number, number> = new Map();
	public readonly id: bigint;
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

	protected static serializePlayerData(player: Player): Buffer {
		const idBin = Buffer.alloc(4);
		idBin.writeUInt32BE(player.id, 0);
		const nameBin = Buffer.from(player.name, "utf-8");
		const nameLengthBin = Buffer.alloc(4);
		nameLengthBin.writeUInt32BE(nameBin.length, 0);
		return Buffer.concat([idBin, nameLengthBin, nameBin]);
	}

	protected serializeAllPlayerData(): Buffer {
		if (this.players.length === 0) return Buffer.from([0]);
		const buffs: Buffer[] = [];
		buffs.push(Buffer.from([this.players.length]));
		for (const p of this.players) buffs.push(GameRoom.serializePlayerData(p));
		return Buffer.concat(buffs);
	}

	public isGameStarted(): boolean {
		return this.players.length >= this.staticFields().playerCount;
	}

	protected serTurnState(): Buffer {
		if (!this.isGameStarted()) return Buffer.alloc(0);
		const turnState = Buffer.alloc(4);
		turnState.writeUInt32BE(this.players[this.turn].id);
		return turnState;
	}

	private sendFullJoinMsg(player: Player) {
		const serRoomID = Buffer.alloc(8);
		const serPlayerData = this.serializeAllPlayerData();
		serRoomID.writeBigUint64BE(this.id);
		player.ws!.send(
			Buffer.concat([
				Buffer.from([gameMsgCodes.joinedRoom]),
				serRoomID,
				Buffer.from([this.isGameStarted() ? 1 : 0]),
				this.serTurnState(),
				serPlayerData,
				this.isGameStarted() ? this.serializeState() : Buffer.alloc(0),
			]),
		);
	}

	private informPlayerJoin(player: Player) {
		this.broadcastMessage(
			Buffer.concat([
				Buffer.from([gameMsgCodes.otherPlayerJoinedRoom]),
				GameRoom.serializePlayerData(player),
			]),
			player,
		);
	}

	private initPlayerIndex() {
		for (let i = 0; i < this.staticFields().playerCount; i++)
			this.playerIndex.set(this.players[i].id, i);
	}

	private startGameIfCan() {
		if (this.isGameStarted()) {
			this.initPlayerIndex();
			this.begin();
			this.broadcastMessage(
				Buffer.concat([
					Buffer.from([gameMsgCodes.gameStarted]),
					this.serTurnState(),
					this.serializeState(),
				]),
			);
		}
	}

	protected isSpectator(player: Player) {
		return this.playerIndex.get(player.id) !== undefined;
	}

	public constructor() {
		this.id = BigInt(Date.now());
	}

	public register(player: Player) {
		this.informPlayerJoin(player);
		this.sendFullJoinMsg(player);
		this.players.push(player);
		player.room = this;
		this.startGameIfCan();
	}

	public addPlayers(players: Player[]) {
		this.players = this.players.concat(players);
		if (this.isGameStarted()) {
			this.initPlayerIndex();
			this.begin();
		}
		for (const p of players) {
			p.room = this;
			this.sendFullJoinMsg(p);
			// this.informPlayerJoin(p);
		}
	}

	public terminate(inform: boolean) {
		if (inform)
			this.broadcastMessage(Buffer.from([gameMsgCodes.gameConcluded]));
		for (const p of this.players) p.room = globalThis.hub;
		this.players = [];
		globalThis.rooms.delete(this.id);
		log.info(`Deleted room [${this.id}]`);
	}

	protected playerExit(player: Player, disconnect: boolean) {
		let disconnectMsg = Buffer.alloc(5);
		disconnectMsg.writeUInt8(gameMsgCodes.otherPlayerDisconnected);
		disconnectMsg.writeUInt32BE(player.id, 1);
		this.broadcastMessage(disconnectMsg);
		if (this.isGameStarted() && this.playerIndex.get(player.id) !== undefined) {
			if (disconnect)
				this.forfeitTimeouts.set(
					player.id,
					setTimeout(() => this.terminate(true), 1000 * 60 * 2.5),
				);
			else this.terminate(true);
		} else {
			this.players = this.players.filter((p) => p.id != player.id);
			player.room = globalThis.hub;
		}
	}

	public onDisconnect(player: Player) {
		this.playerExit(player, true);
		log.info(`<${player.name}> disconnected from [${this.id}]`);
	}

	public onRejoin(player: Player): void {
		clearTimeout(this.forfeitTimeouts.get(player.id));
		this.informPlayerJoin(player);
		this.sendFullJoinMsg(player);
		log.info(`<${player.name}> reconnected to [${this.id}]`);
	}

	public onChat(player: Player, message: Buffer): void {
		message.writeUInt32BE(player.id, 1);
		this.broadcastMessage(message, player);
	}

	protected generalPlayerEvents(player: Player, msg: Buffer): boolean {
		if (msg.length === 1 && msg.readUint8(0) === gameMsgCodes.leftRoom) {
			this.playerExit(player, false);
			return true;
		}
		return false;
	}

	abstract onMessage(player: Player, message: Buffer): void;
	abstract begin(): void;
	abstract serializeState(): Buffer;
}
