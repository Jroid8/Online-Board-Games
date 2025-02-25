import { createContext } from "react";
import PlayerInfo from "../common/PlayerInfo";
import { socketFetch } from "../common/SocketUtils";
import GameInfo from "../common/GameInfo";

export class GameState {
	public players: PlayerInfo[] = [];
	public matchID: bigint = 0n;
	public inMatch: boolean = false;
	public waitingForPlayers: boolean = true;
	public gameID: number = -1;
	public gameList: GameInfo[] = [];

	private getWS: () => WebSocket;
	private navigate: (path: string) => void;

	constructor(wsSingleton: () => WebSocket, navigator: (path: string) => void) {
		this.getWS = wsSingleton;
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
	}

	private async requestMatch(gameID: number, code: number) {
		const ws = this.getWS();
		const res = await socketFetch(ws, new Uint8Array([code, gameID]));
		if (res.getUint8(0) == 0xc0) {
			this.readJoinMsg(res);
			this.navigate(
				"/match/" + this.gameList[gameID].urlName + "/" + this.matchID,
			);
		} else alert("Bad server response");
	}

	public async reqRandomMatch(gameID: number) {
		await this.requestMatch(gameID, 0x11);
	}

	public async reqRoom(gameID: number) {
		await this.requestMatch(gameID, 0x12);
	}

	public async reqMatchWithFriends(gameID: number) {
		await this.requestMatch(gameID, 0x13);
	}
}

export const GameContext = createContext<null | GameState>(null);
