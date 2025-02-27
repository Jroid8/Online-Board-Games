import { useStateStore } from "../ClientState";
import { Cell } from "./states";

function Slot({ value, onClick }: { value: Cell; onClick: () => void }) {
	let content = " ";
	switch (value) {
		case Cell.X:
			content = "X";
			break;
		case Cell.O:
			content = "O";
			break;
	}
	return (
		<button
			css={{
				display: "inline-flex",
				alignItems: "center",
				justifyContent: "center",
				padding: 0,
				backgroundColor: "white",
				border: "0.1ch",
				outline: "none",
				borderRadius: "1rem",
				fontWeight: "bold",
				fontSize: "10vmin",
			}}
			onClick={onClick}
		>
			{content}
		</button>
	);
}

export default function TicTacToe() {
	const state = useStateStore();
	return (
		<div
			css={{
				display: "grid",
				gridTemplateRows: "repeat(3, 1fr)",
				gridTemplateColumns: "repeat(3, 1fr)",
				height: "100%",
			}}
		>
			{}
		</div>
	);
}
