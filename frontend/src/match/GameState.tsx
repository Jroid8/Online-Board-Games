import { createContext } from "react";
import PlayerInfo from "../common/PlayerInfo";
import GameInfo from "../common/GameInfo";
import { SocketManager } from "../contexts/SocketManager";

export class GameState {
	public players: PlayerInfo[] = [];
	public matchID: bigint = 0n;
	public inMatch: boolean = false;
	public waitingForPlayers: boolean = true;
	public gameID: number = -1;
	public gameList: GameInfo[] = [];

	private sm: SocketManager;
	private navigate: (path: string) => void;
	private startState: ArrayBuffer | null = null;

	constructor(socketManager: SocketManager, navigator: (path: string) => void) {
		this.sm = socketManager;
		this.navigate = navigator;
	}

	public gameListResolved(gameList: GameInfo[]) {
		this.gameList = gameList;
	}

	private readJoinMsg(msg: DataView<ArrayBuffer>) {
		const decoder = new TextDecoder("utf-8");
		this.matchID = msg.getBigUint64(1);
		this.waitingForPlayers = msg.getUint8(9) == 0;
		const playerCount = msg.getUint8(10);
		this.players = new Array(playerCount);
		let offset = 11;
		for (let i = 0; i < playerCount; i++) {
			const id = msg.getUint32(offset);
			offset += 4;
			const len = msg.getUint32(offset);
			offset += 4;
			this.players.push({
				id,
				name: decoder.decode(new Uint8Array(msg.buffer, offset, len)),
			});
			offset += len;
		}
		this.startState = msg.buffer.slice(offset);
	}

	public async joinMatch(gameID: number, matchID: bigint) {
		await this.sm.waitForOpen();
		const msg = new DataView(new ArrayBuffer(10));
		msg.setUint8(0, 0x10);
		msg.setUint8(1, gameID);
		msg.setBigUint64(2, matchID);
		const res = await this.sm.fetch(msg.buffer);
		if (res.getUint8(0) == 0xc0) {
			this.readJoinMsg(res);
			this.inMatch = true;
			this.navigate(
				"/match/" + this.gameList[gameID].urlName + "/" + this.matchID,
			);
			return true;
		} else {
			alert("Bad server response");
			return false;
		}
	}

	public async getStartState(
		gameID: number,
		matchID: bigint,
	): Promise<DataView<ArrayBuffer>> {
		if (!this.inMatch) await this.joinMatch(gameID, matchID);
		return new DataView(this.startState!);
	}

	private async requestMatch(gameID: number, code: number): Promise<boolean> {
		await this.sm.waitForOpen();
		const res = await this.sm.fetch(new Uint8Array([code, gameID]));
		if (res.getUint8(0) == 0xc0) {
			this.readJoinMsg(res);
			this.inMatch = true;
			this.navigate(
				"/match/" + this.gameList[gameID].urlName + "/" + this.matchID,
			);
			return true;
		} else {
			alert("Bad server response");
			return false;
		}
	}

	public async reqRandomMatch(gameID: number): Promise<boolean> {
		return this.requestMatch(gameID, 0x11);
	}

	public async reqRoom(gameID: number): Promise<boolean> {
		return this.requestMatch(gameID, 0x12);
	}

	public async reqMatchWithFriends(gameID: number): Promise<boolean> {
		return this.requestMatch(gameID, 0x13);
	}
}

export const GameContext = createContext<null | GameState>(null);
