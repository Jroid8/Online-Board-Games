import log from "loglevel";
import { GameRoom, gameMsgCodes } from "../game-room";
import { Player } from "../player";

enum BoardSlot {
	Empty = 0,
	X = 1,
	O = 2,
}

export default class TicTacToe extends GameRoom {
	static id: number = 0;
	static playerCount: number = 2;
	static gameName: string = "Tic-Tac-Toe";

	playerX: number = 0;
	board: BoardSlot[][];
	turn: number = 0;

	constructor() {
		super();
		this.board = Array.from({ length: 3 }, () =>
			new Array(3).fill(BoardSlot.Empty),
		);
		log.trace(`Created room [${this.id}] for Tic-Tac-Toe`);
	}

	checkWin(x: number, y: number): boolean {
		const mark = this.board[y][x];
		if ([0, 1, 2].every((i) => this.board[y][i] === mark)) return true;
		if ([0, 1, 2].every((i) => this.board[i][x] === mark)) return true;
		return (
			(this.board[0][0] === this.board[1][1] &&
				this.board[1][1] === this.board[2][2] &&
				this.board[2][2] === mark) ||
			(this.board[0][2] === this.board[1][1] &&
				this.board[1][1] === this.board[2][0] &&
				this.board[2][0] === mark)
		);
	}

	onMessage(player: Player, msg: Buffer): void {
		if (this.generalPlayerEvents(player, msg)) return;
		let playerIndex = this.playerIndex.get(player.id);
		if (playerIndex === null || msg.length <= 1 || msg[0] != 1) return;
		const [x, y] = [msg[1] % 3, Math.floor(msg[1] / 3)];
		if (playerIndex !== this.turn || this.board[y][x] != BoardSlot.Empty)
			return;

		this.board[y][x] = player.id == this.playerX ? BoardSlot.X : BoardSlot.O;
		let update = Buffer.alloc(6);
		update.writeUInt8(1);
		update.writeUInt32BE(player.id, 1);
		update.writeUInt8(msg[1], 5);
		this.broadcastMessage(update, player);

		if (this.checkWin(x, y)) {
			let winMsg = Buffer.alloc(5);
			winMsg.writeUInt8(gameMsgCodes.gameConcluded);
			winMsg.writeUInt32BE(player.id, 1);
			this.broadcastMessage(winMsg);
			for (const p of this.players) p.room = globalThis.hub;
		} else {
			this.turn = 1 - this.turn;
			this.broadcastMessage(
				Buffer.concat([
					Buffer.from([gameMsgCodes.playerTurn]),
					this.serTurnState(),
				]),
			);
		}
	}

	serializeState(): Buffer {
		let state = Buffer.alloc(4 + 9);
		state.writeUInt32BE(this.playerX);
		for (let i = 0; i < 9; i++)
			state.writeUInt8(this.board[Math.floor(i / 3)][i % 3], i + 4);
		return state;
	}

	begin() {
		const idx = Math.floor(Math.random() * 2);
		this.playerX = this.players[idx].id;
		this.turn = idx;
	}
}
