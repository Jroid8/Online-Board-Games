import {
	InGameNotStarted,
	Playing,
	State,
	useStateStore,
} from "../ClientState";
import { Cell, CurrentState, markCell } from "./states";
import xSVG from "./xmark.svg";
import oSVG from "./omark.svg";

function Slot({
	value,
	onClick,
	myTurn,
}: {
	value: Cell;
	onClick: () => void;
	myTurn: boolean;
}) {
	let src = null;
	switch (value) {
		case Cell.X:
			src = xSVG;
			break;
		case Cell.O:
			src = oSVG;
			break;
	}
	const img = src ? (
		<img
			src={src}
			css={{
				height: "70%",
				display: "block",
				marginLeft: "auto",
				marginRight: "auto",
			}}
		/>
	) : (
		<></>
	);
	return (
		<button
			css={{
				backgroundColor: "white",
				borderRadius: "2vmin",
				border: "none",
				boxShadow: "0 0 25px #aaa",
				cursor: "pointer",
				"&:disabled": {
					cursor: "not-allowed",
					backgroundColor: "lightgray"
				}
			}}
			disabled={!myTurn || src !== null}
			onClick={onClick}
		>
			{img}
		</button>
	);
}

const emptyBoard = new Array(9).fill(Cell.Empty);

export default function TicTacToe() {
	const socket = useStateStore((state) => (state as InGameNotStarted).socket);
	const myTurn = useStateStore((state) => (state as Playing).myTurn);
	const board = useStateStore((state) =>
		state.state === State.Playing ? state.board : emptyBoard,
	);

	function handleClick(index: number) {
		const current = useStateStore.getState() as CurrentState;
		markCell(
			current,
			useStateStore.setState,
			index,
			current.user.id === current.xPlayer ? Cell.X : Cell.O,
		);
		socket.send(new Uint8Array([1, index]));
	}

	return (
		<div
			css={{
				display: "grid",
				gridTemplateRows: "repeat(3, 28vmin)",
				gridTemplateColumns: "repeat(3, 28vmin)",
				height: "100%",
				gap: "3vmin",
			}}
		>
			{board.map((c, i) => (
				<Slot
					key={i}
					myTurn={myTurn}
					value={c}
					onClick={() => handleClick(i)}
				/>
			))}
		</div>
	);
}
