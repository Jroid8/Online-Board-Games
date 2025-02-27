import { useStateStore } from "../ClientState";
import { Cell } from "./states";
import xSVG from "./xmark.svg";
import oSVG from "./omark.svg";
import randPastelColor from "../../utils/RandPastelColor";

function Slot({ value, onClick }: { value: Cell; onClick: () => void }) {
	let img = "";
	switch (value) {
		case Cell.X:
			img = xSVG;
			break;
		case Cell.O:
			img = oSVG;
			break;
	}
	return (
		<button
			css={{
				backgroundColor: "white",
				borderRadius: "2vmin",
				border: "none",
				boxShadow: "0 0 25px #aaa"
			}}
			onClick={onClick}
		>
			<img
				src={img}
				css={{
					height: "70%",
					display: "block",
					marginLeft: "auto",
					marginRight: "auto",
				}}
			/>
		</button>
	);
}

export default function TicTacToe() {
	// const state = useStateStore();
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
			<Slot value={1} onClick={() => {}} />
			<Slot value={0} onClick={() => {}} />
			<Slot value={1} onClick={() => {}} />
			<Slot value={1} onClick={() => {}} />
			<Slot value={2} onClick={() => {}} />
			<Slot value={2} onClick={() => {}} />
			<Slot value={2} onClick={() => {}} />
			<Slot value={0} onClick={() => {}} />
			<Slot value={0} onClick={() => {}} />
		</div>
	);
}
