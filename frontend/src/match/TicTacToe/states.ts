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

export interface TicTacToeState {
	xPlayer: number;
	board: Cell[][];
}

export function deserialize(data: DataView<ArrayBuffer>): TicTacToeState {
	const board: Cell[][] = [];
	for (let i = 0; i < 9; i++) {
		const y = Math.floor(i / 3);
		if (i % 3 == 0) board[y] = [];
		board[y][i % 3] = deserCell(data.getInt8(i + 1));
	}
	return { xPlayer: data.getUint32(0), board };
}
