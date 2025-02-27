import { Playing } from "../ClientState";

export enum Cell {
	Empty,
	X,
	O,
}

function deserCell(value: number): Cell {
	switch (value) {
		case 1:
			return Cell.X;
		case 2:
			return Cell.O;
		default:
			return Cell.Empty;
	}
}

export type CurrentState = Playing & TicTacToeState;

export interface TicTacToeState {
	xPlayer: number;
	board: Cell[];
}

export function markCell(
	current: CurrentState,
	setState: (state: Partial<CurrentState>) => void,
	index: number,
	mark: Cell,
) {
	const newBoard = current.board.slice();
	newBoard[index] = mark;
	setState({ board: newBoard });
}

export function deserialize(data: DataView<ArrayBuffer>): TicTacToeState {
	const board: Cell[] = [];
	for (let i = 0; i < 9; i++) board[i] = deserCell(data.getInt8(i + 4));
	const xPlayer = data.getUint32(0);
	return { xPlayer, board };
}
