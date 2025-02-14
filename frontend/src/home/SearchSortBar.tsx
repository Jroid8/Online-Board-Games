import "./SearchSortBar.css";
import { useEffect, useState } from "react";
import GameInfo from "./GameInfo";
import randPastelColor from "../common/randPastelColor";

const sortByToOrderName: { [key: string]: string[] } = {
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
	const [sortBy, setSortBy] = useState("name");
	const [order, setOrder] = useState("nomral");
	const [orderNames, setOrderNames] = useState(sortByToOrderName.name);

	useEffect(() => {
		setOrderNames(sortByToOrderName[sortBy]);
	}, [sortBy]);
	useEffect(() => {
		const compareFn =
			order[0] === "n"
				? sortMethods[sortBy]
				: (a: GameInfo, b: GameInfo) => -sortMethods[sortBy](a, b);
		setGameList([...wholeGameList].sort(compareFn));
	}, [sortBy, order, setGameList, wholeGameList]);

	return (
		<div className="top-bar">
			<input type="text" style={{ backgroundColor: randPastelColor() }} />
			<span>Order by:</span>
			<select
				name="sort"
				value={sortBy}
				onChange={(e) => setSortBy(e.target.value)}
				style={{ backgroundColor: randPastelColor() }}
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
