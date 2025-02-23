import GameRoom from "../game-room";
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

  board: BoardSlot[][];
  turn: number;

  constructor(players?: Player[]) {
    super(players);
    this.board = Array.from({ length: 3 }, () =>
      new Array(3).fill(BoardSlot.Empty),
    );
		console.log(JSON.stringify(this.board));
    this.turn = 0;
  }

  checkWin(x: number, y: number): boolean {
    const mark = this.board[x][y];
    if ([0, 1, 2].every((i) => this.board[y][i] == mark)) return true;
    if ([0, 1, 2].every((i) => this.board[i][x] == mark)) return true;
    return (
      (this.board[0][0] == this.board[1][1] &&
        this.board[1][1] == this.board[2][2] &&
        this.board[2][2] == mark) ||
      (this.board[0][2] == this.board[1][1] &&
        this.board[1][1] == this.board[2][0] &&
        this.board[2][0] == mark)
    );
  }

  onMessage(player: Player, msg: Buffer): void {
    let playerIndex = this.getPlayerIndex(player);
    if (playerIndex === null || msg.length <= 1 || msg[0] != 1) return;
    const [x, y] = [msg[1] % 3, Math.floor(msg[1] / 3)];
    if (playerIndex !== this.turn || this.board[y][x] != BoardSlot.Empty)
      return;
    this.board[y][x] = playerIndex ? BoardSlot.O : BoardSlot.X;
    let update = Buffer.alloc(6);
    update.writeUInt8(1, 4);
    update.writeUInt32BE(player.id, 1);
    update.writeUInt8(msg[1], 4);
    for (const p of this.players) if (p.id != player.id) p.ws!.send(update);
    if (this.checkWin(x, y)) {
      let winMsg = Buffer.alloc(5);
      winMsg.writeUInt8(235);
      winMsg.writeUInt32BE(player.id, 1);
      for (const p of this.players) {
        p.ws!.send(winMsg);
        p.room = globalThis.hub;
      }
    } else {
      player.ws!.send(Buffer.from([220]));
      this.turn = 1 - this.turn;
    }
  }

  begin(): Buffer {
    if (Math.random() > 0.5) this.players.reverse();
    let state = Buffer.alloc(8);
    for (let i = 0; i < this.players.length; i++)
      state.writeUInt32BE(this.players[i].id, i * 4);
    return state;
  }

  serializeState(): Buffer {
    let state = Buffer.alloc(9);
    for (let i = 0; i < this.players.length; i++)
      state.writeUInt8(this.board[Math.floor(i / 3)][i % 3], i);
    return state;
  }
}
