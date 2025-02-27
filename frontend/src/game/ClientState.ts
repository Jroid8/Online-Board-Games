import { create } from "zustand";
import PlayerInfo from "../utils/PlayerInfo";
import { socketFetch } from "../utils/SocketUtils";
import {
	deserialize as deserTicTacToe,
	TicTacToeState,
} from "./TicTacToe/states";
import MsgCodes from "../utils/MessageCodes";

type AvailableGameStates = TicTacToeState;

const gameStateDeser: Record<
	number,
	(data: ArrayBuffer) => AvailableGameStates
> = {
	0: (data) => deserTicTacToe(new DataView(data)),
};

export enum State {
	Disconnected,
	InHub,
	InGameNotStarted,
	Playing,
}

export interface Disconnected {
	state: State.Disconnected;
}

export interface InHub {
	state: State.InHub;
	socket: WebSocket;
}

export interface InGameNotStarted {
	state: State.InGameNotStarted;
	socket: WebSocket;
	players: PlayerInfo[];
	matchID: bigint;
	gameID: number;
}

export interface Playing {
	state: State.Playing;
	socket: WebSocket;
	players: PlayerInfo[];
	matchID: bigint;
	gameID: number;
	paused: boolean;
}

export type PossibleStates =
	| Disconnected
	| InHub
	| InGameNotStarted
	| (Playing & TicTacToeState);

export type StateStore = {
	connect: () => Promise<void>;
	joinMatch: (
		gameID: number,
		matchID: bigint,
		gameURLName: string,
		navigate: (path: string) => void,
	) => Promise<void>;
	requestMatch: (
		gameID: number,
		matchTypeCode: number,
		gameURLName: string,
		navigate: (path: string) => void,
	) => Promise<void>;
} & PossibleStates;

export const useStateStore = create<StateStore>()((set, get) => {
	function readJoinMsg(msg: DataView<ArrayBuffer>, gameID: number): bigint {
		const current = get();
		if (current.state !== State.InHub) return 0n;
		const decoder = new TextDecoder("utf-8");
		const matchID = msg.getBigUint64(1);
		const waiting = msg.getUint8(9) == 0;
		const playerCount = msg.getUint8(10);
		const players = new Array(playerCount);
		let offset = 11;
		for (let i = 0; i < playerCount; i++) {
			const id = msg.getUint32(offset);
			offset += 4;
			const len = msg.getUint32(offset);
			offset += 4;
			players.push({
				id,
				name: decoder.decode(new Uint8Array(msg.buffer, offset, len)),
			});
			offset += len;
		}
		const gameState = waiting
			? gameStateDeser[gameID](msg.buffer.slice(offset))
			: undefined;
		const ingame: InGameNotStarted = {
			state: State.InGameNotStarted,
			socket: current.socket,
			players,
			matchID,
			gameID,
		};
		current.socket.addEventListener("message", gameMsgListener);
		set(
			waiting
				? ingame
				: {
						...ingame,
						...gameState,
						state: State.Playing,
						paused: false,
					},
		);
		return matchID;
	}

	async function establish(): Promise<WebSocket> {
		const ws = new WebSocket("ws://" + location.host);
		ws.binaryType = "arraybuffer";
		return new Promise((resolve, reject) => {
			ws.onopen = function onOpen() {
				resolve(ws);
				ws.onclose = ws.onerror = ws.onopen = null;
			};
			ws.onclose = (ev: CloseEvent) => {
				reject(ev.reason);
				ws.onclose = ws.onerror = ws.onopen = null;
			};
			ws.onerror = () => {
				reject();
				ws.onclose = ws.onerror = ws.onopen = null;
			};
		});
	}

	return {
		state: State.Disconnected,
		connect: async () => {
			if (get().state === State.Disconnected)
				set({ state: State.InHub, socket: await establish() });
		},
		joinMatch: async (gameID: number, matchID: bigint) => {
			const state = get();
			if (state.state !== State.InHub) return;
			const msg = new DataView(new ArrayBuffer(10));
			msg.setUint8(0, 0x10);
			msg.setUint8(1, gameID);
			msg.setBigUint64(2, matchID);
			const res = await socketFetch(state.socket, msg.buffer);
			if (res.getUint8(0) == MsgCodes.game.joinedRoom) {
				readJoinMsg(res, gameID);
			} else alert("Invalid server response");
		},
		requestMatch: async (
			gameID: number,
			matchTypeCode: number,
			gameURLName: string,
			navigate: (path: string) => void,
		) => {
			const state = get();
			if (state.state !== State.InHub) return;
			const res = await socketFetch(
				state.socket,
				new Uint8Array([matchTypeCode, gameID]),
			);
			if (res.getUint8(0) == MsgCodes.game.joinedRoom) {
				navigate(
					"/game/" + gameURLName + "/" + readJoinMsg(res, gameID).toString(),
				);
			} else alert("Invalid server response");
		},
	};
});
