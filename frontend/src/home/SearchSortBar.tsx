import "./SearchSortBar.css";
import { useEffect, useState } from "react";
import GameInfo from "./GameInfo";
import randPastelColor from "../common/randPastelColor";

const sortByToOrderName: { [key: string]: string[] } = {
	name: ["A-Z", "Z-A"],
	player: ["Descending", "Ascending"],
};

export default function SearchSortBar({
	gameList,
	setGameList,
}: {
	gameList: GameInfo[];
	setGameList: React.Dispatch<React.SetStateAction<GameInfo[]>>;
}) {
	const [sortBy, setSortBy] = useState("name");
	const [order, setOrder] = useState("nomral");
	const [orderNames, setOrderNames] = useState(sortByToOrderName.name);

	useEffect(() => {
		setOrderNames(sortByToOrderName[sortBy]);
	}, [sortBy]);

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
