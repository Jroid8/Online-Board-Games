import { InHub, Playing } from "../ClientState";

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
	myMark: Cell;
	board: Cell[];
	myTurn: boolean;
}

export function markCell(
	current: CurrentState,
	setState: (state: Partial<CurrentState>) => void,
	index: number,
) {
	const newBoard = current.board.slice();
	newBoard[index] = current.myMark;
	setState({ board: newBoard, myTurn: false });
}

export function deserialize(
	current: Omit<InHub, "state">,
	data: DataView<ArrayBuffer>,
): TicTacToeState {
	const board: Cell[] = [];
	for (let i = 0; i < 9; i++) board[i] = deserCell(data.getInt8(i + 4));
	const xPlayer = data.getUint32(0);
	return {
		myMark: xPlayer === current.user.id ? Cell.X : Cell.O,
		board,
		myTurn: current.user.id === xPlayer,
	};
}
