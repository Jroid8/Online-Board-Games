import { create } from "zustand";
import PlayerInfo from "../common/PlayerInfo";
import { socketFetch } from "../common/SocketUtils";

export enum Status {
	Disconnected,
	InHub,
	InGameNotStarted,
	Playing,
}

export interface Disconnected {
	status: Status.Disconnected;
}

export interface InHub {
	status: Status.InHub;
	socket: WebSocket;
}

export interface InGameNotStarted {
	status: Status.InGameNotStarted;
	socket: WebSocket;
	players: PlayerInfo[];
	matchID: bigint;
	gameID: number;
}

export interface Playing {
	status: Status.Playing;
	socket: WebSocket;
	players: PlayerInfo[];
	matchID: bigint;
	gameID: number;
	startSerState: ArrayBuffer;
	paused: boolean;
}

export type PossibleStates = Disconnected | InHub | InGameNotStarted | Playing;

export interface StateStore {
	state: PossibleStates;
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
}

export const useStateStore = create<StateStore>()((set, get) => {
	function readJoinMsg(msg: DataView<ArrayBuffer>, gameID: number): bigint {
		const current = get().state;
		if (current.status !== Status.InHub) return 0n;
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
		const ingame: InGameNotStarted = {
			status: Status.InGameNotStarted,
			socket: current.socket,
			players,
			matchID,
			gameID,
		};
		set({
			state: waiting
				? ingame
				: {
						...ingame,
						status: Status.Playing,
						startSerState: msg.buffer.slice(offset),
						paused: false,
					},
		});
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
		state: { status: Status.Disconnected },
		connect: async () => {
			if (get().state.status === Status.Disconnected)
				set({ state: { status: Status.InHub, socket: await establish() } });
		},
		joinMatch: async (gameID: number, matchID: bigint) => {
			const { state } = get();
			if (state.status !== Status.InHub) return;
			const msg = new DataView(new ArrayBuffer(10));
			msg.setUint8(0, 0x10);
			msg.setUint8(1, gameID);
			msg.setBigUint64(2, matchID);
			const res = await socketFetch(state.socket, msg.buffer);
			if (res.getUint8(0) == 0xc0) {
				readJoinMsg(res, gameID);
			} else {
				alert("Invalid server response");
			}
		},
		requestMatch: async (
			gameID: number,
			matchTypeCode: number,
			gameURLName: string,
			navigate: (path: string) => void,
		) => {
			const { state } = get();
			if (state.status !== Status.InHub) return;
			const res = await socketFetch(
				state.socket,
				new Uint8Array([matchTypeCode, gameID]),
			);
			if (res.getUint8(0) == 0xc0) {
				navigate("/match/" + gameURLName + "/" + readJoinMsg(res, gameID));
			}
		},
	};
});
