import {
	InGameNotStarted,
	Playing,
	State,
	useStateStore,
} from "../ClientState";
import { Cell, CurrentState, markCell } from "./states";
import xSVG from "./xmark.svg";
import oSVG from "./omark.svg";
import PastelFloatBtn from "../../components/PastelFloatBtn";
import { useState } from "react";
import randPastelColor from "../../utils/RandPastelColor";

function Slot({
	value,
	onClick,
	myTurn,
	color,
}: {
	value: Cell;
	onClick: () => void;
	myTurn: boolean;
	color: string;
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
		<PastelFloatBtn
			css={{
				textAlign: "center",
				display: "flex",
				justifyContent: "space-between",
				alignItems: "center",
				height: "100%",
			}}
			style={{
				backgroundColor: color,
				cursor: myTurn && src === null ? "pointer" : "not-allowed",
			}}
			onClick={onClick}
		>
			{img}
		</PastelFloatBtn>
	);
}

const emptyBoard = new Array(9).fill(Cell.Empty);

export default function TicTacToe() {
	const socket = useStateStore((state) => (state as InGameNotStarted).socket);
	const myTurn = useStateStore((state) => (state as Playing).myTurn);
	const board = useStateStore((state) =>
		state.state === State.Playing ? state.board : emptyBoard,
	);
	const [color] = useState(() => randPastelColor().toString());

	function handleClick(index: number) {
		const current = useStateStore.getState() as CurrentState;
		if (!current.myTurn) return;
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
				gap: "2ch",
			}}
		>
			{board.map((c, i) => (
				<Slot
					key={i}
					myTurn={myTurn}
					value={c}
					color={color}
					onClick={() => handleClick(i)}
				/>
			))}
		</div>
	);
}
