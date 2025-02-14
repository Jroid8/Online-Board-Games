import "./SearchSortBar.css";
import { useEffect, useRef, useState } from "react";
import GameInfo from "./GameInfo";
import randPastelColor from "../common/randPastelColor";

const sortMetToOrderName: { [key: string]: string[] } = {
	name: ["A-Z", "Z-A"],
	player: ["Descending", "Ascending"],
};

const sortMethods: { [key: string]: (a: GameInfo, b: GameInfo) => number } = {
	name: (a, b) => a.name.localeCompare(b.name),
	player: (a, b) => a.playersOnline - b.playersOnline,
};

export default function SearchSortBar({
	wholeGameList,
	setGameList,
}: {
	wholeGameList: GameInfo[];
	setGameList: React.Dispatch<React.SetStateAction<GameInfo[]>>;
}) {
	const sortMet = useRef<null | HTMLSelectElement>(null);
	const [order, setOrder] = useState("nomral");
	const [orderNames, setOrderNames] = useState(sortMetToOrderName.name);

	function onSortMetChanged() {
		setOrderNames(sortMetToOrderName[sortMet.current!.value]);
		console.log(sortMet.current!.value);
	}

	useEffect(() => {
		const property = sortMet.current!.value;
		const compareFn =
			order[0] === "n"
				? sortMethods[property]
				: (a: GameInfo, b: GameInfo) => -sortMethods[property](a, b);
		setGameList([...wholeGameList].sort(compareFn));
	}, [sortMet, order, setGameList, wholeGameList]);

	return (
		<div className="top-bar">
			<input type="text" style={{ backgroundColor: randPastelColor() }} />
			<span>Order by:</span>
			<select
				name="sort"
				style={{ backgroundColor: randPastelColor() }}
				ref={sortMet}
				onChange = {onSortMetChanged}
			>
				<option value="name">Name</option>
				<option value="player">Player Count</option>
			</select>
			<select
				name="order"
				value={order}
				onChange={(e) => setOrder(e.target.value)}
				style={{ backgroundColor: randPastelColor() }}
			>
				<option value="normal">{orderNames[0]}</option>
				<option value="reverse">{orderNames[1]}</option>
			</select>
		</div>
	);
}
