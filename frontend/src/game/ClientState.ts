import { create } from "zustand";
import PlayerInfo from "../utils/PlayerInfo";
import { socketFetch } from "../utils/SocketUtils";
import {
	deserialize as deserTicTacToe,
	TicTacToeState,
} from "./TicTacToe/states";
import MsgCodes from "../utils/MessageCodes";
import ticTacToeListener from "./TicTacToe/listener";
import Cookies from "js-cookie";

type AvailableGameStates = TicTacToeState;

const gameStateDeser: Record<
	number,
	(data: ArrayBuffer) => AvailableGameStates
> = {
	0: (data) => deserTicTacToe(new DataView(data)),
};

const gameMsgListener: Record<number, (event: MessageEvent) => void> = {
	0: (event) => ticTacToeListener(new DataView(event.data)),
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
	user: PlayerInfo;
}

export interface InGameNotStarted {
	state: State.InGameNotStarted;
	socket: WebSocket;
	user: PlayerInfo;
	players: PlayerInfo[];
	matchID: bigint;
	gameID: number;
}

export interface Playing {
	state: State.Playing;
	socket: WebSocket;
	user: PlayerInfo;
	players: PlayerInfo[];
	matchID: bigint;
	gameID: number;
	winner: null | PlayerInfo;
	paused: boolean;
	listener: (event: MessageEvent) => void;
	turn: number;
	myTurn: boolean;
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
	function deserPlayerData(
		data: DataView<ArrayBuffer>,
		offset: number = 0,
	): [PlayerInfo, number] {
		const decoder = new TextDecoder("utf-8");
		const id = data.getUint32(offset);
		offset += 4;
		const len = data.getUint32(offset);
		offset += 4;
		const player = {
			id,
			name: decoder.decode(data.buffer.slice(offset, offset + len)),
		};
		return [player, offset + len];
	}

	function commonMsgListener(event: MessageEvent) {
		const msg = new DataView(event.data);
		const current = get();
		if (current.state === State.InGameNotStarted) {
			switch (msg.getUint8(0)) {
				case MsgCodes.game.gameStarted:
					current.socket.addEventListener(
						"message",
						gameMsgListener[current.gameID],
					);
					set({
						...gameStateDeser[current.gameID](msg.buffer.slice(5)),
						state: State.Playing,
						paused: false,
						listener: gameMsgListener[current.gameID],
						turn: msg.getUint32(1),
						myTurn: msg.getUint32(1) === current.user.id,
						winner: null,
					});
					break;
				case MsgCodes.game.otherPlayerJoinedRoom:
					set({ players: [...current.players, deserPlayerData(msg, 1)[0]] });
					break;
				case MsgCodes.game.otherPlayerDisconnected:
					{
						const discPlayer = msg.getUint32(1);
						set({
							players: current.players.filter((p) => p.id !== discPlayer),
						});
					}
					break;
				case MsgCodes.game.gameConcluded:
					switchBackwards(State.InHub);
					break;
			}
		} else if (current.state === State.Playing) {
			switch (msg.getUint8(0)) {
				case MsgCodes.game.otherPlayerJoinedRoom:
					set({ players: [...current.players, deserPlayerData(msg, 1)[0]] });
					break;
				case MsgCodes.game.otherPlayerDisconnected:
					// TODO
					break;
				case MsgCodes.game.gameConcluded:
					{
						const id = msg.getUint32(1);
						const player = current.players.find((p) => p.id === id);
						if (player === undefined) {
							alert("Invalid server response");
							switchBackwards(State.Disconnected);
							break;
						}
						set({ winner: { id, name: player.name } });
					}
					break;
			}
		}
	}

	function switchBackwards(target: State.Disconnected | State.InHub) {
		// assuming I don't call this in disconnected state
		const current = get() as InHub | InGameNotStarted | Playing;
		const funcs = Object.fromEntries(
			Object.entries(current).filter((e) => typeof e[1] === "function"),
		);
		// also redirect
		if (current.state === State.Playing)
			current.socket.removeEventListener("message", current.listener);
		switch (target) {
			case State.Disconnected:
				current.socket.onmessage =
					current.socket.onclose =
					current.socket.onerror =
						null;
				return set({ ...funcs, state: State.Disconnected });
			case State.InHub:
				return set({ ...funcs, state: State.InHub, socket: current.socket });
		}
	}

	function socketError() {
		alert("Unexpected error occured");
		switchBackwards(State.Disconnected);
	}

	function readJoinMsg(msg: DataView<ArrayBuffer>, gameID: number): bigint {
		const current = get();
		if (current.state !== State.InHub) return 0n;
		const matchID = msg.getBigUint64(1);
		const waiting = msg.getUint8(9) == 0;
		let offset = 10;
		const turn = waiting ? undefined : msg.getUint32(offset);
		if (!waiting) offset += 4;
		const playerCount = msg.getUint8(offset);
		offset += 1;
		const players = new Array(playerCount);
		for (let i = 0; i < playerCount; i++) {
			const [p, o] = deserPlayerData(msg, offset);
			players.push(p);
			offset = o;
		}
		const gameState = waiting
			? undefined
			: gameStateDeser[gameID](msg.buffer.slice(offset));
		if (!waiting)
			current.socket.addEventListener("message", gameMsgListener[gameID]);
		const ingame: InGameNotStarted = {
			state: State.InGameNotStarted,
			socket: current.socket,
			user: current.user,
			players,
			matchID,
			gameID,
		};
		set(
			waiting
				? ingame
				: {
						...ingame,
						...gameState,
						state: State.Playing,
						paused: false,
						listener: gameMsgListener[gameID],
						turn,
						myTurn: turn === current.user.id,
						winner: null,
					},
		);
		return matchID;
	}

	return {
		state: State.Disconnected,
		connect: async () => {
			return new Promise((resolve, reject) => {
				if (get().state !== State.Disconnected) return;
				const isGuest = !Cookies.get("session");
				const ws = new WebSocket("ws://localhost:8080"); // CHANGE ME
				ws.binaryType = "arraybuffer";
				ws.onerror = ws.onclose = reject;
				ws.onopen = () => {
					ws.onopen = null;
					ws.onmessage = (ev) => {
						const playerID = new DataView(ev.data).getUint32(0);
						ws.onmessage = commonMsgListener;
						ws.onerror = ws.onclose = socketError;
						set({
							state: State.InHub,
							socket: ws,
							user: {
								id: playerID,
								name: isGuest ? "Guest" + playerID : "#TODO",
							},
						});
						resolve();
					};
				};
				ws.onerror = ws.onclose = () => {
					console.error("Failed to connect to server");
				};
			});
		},
		joinMatch: async (gameID: number, matchID: bigint) => {
			if (get().state === State.Disconnected) await get().connect();
			const state = get() as InHub;
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
			if (get().state === State.Disconnected) await get().connect();
			const state = get() as InHub;
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
