import "./SearchSortBar.css";
import { useEffect, useState } from "react";
import GameInfo from "./GameInfo";
import randPastelColor from "../common/randPastelColor";

const sortMetToOrderName: { [key: string]: string[] } = {
	name: ["A-Z", "Z-A"],
	player: ["Descending", "Ascending"],
};

const sortMethods: { [key: string]: (a: GameInfo, b: GameInfo) => number } = {
	name: (a, b) => a.name.localeCompare(b.name),
	player: (a, b) => b.playersOnline - a.playersOnline,
};

export default function SearchSortBar({
	oninput,
}: {
	oninput: (
		filter: string,
		sortMet: (a: GameInfo, b: GameInfo) => number,
	) => void;
}) {
	const [searchInpColor] = useState(() => randPastelColor());
	const [sortMetColor] = useState(() => randPastelColor());
	const [orderColor] = useState(() => randPastelColor());
	const [filter, setFilter] = useState("");
	const [sortMet, setSortMet] = useState("name");
	const [order, setOrder] = useState("normal");
	const [orderNames, setOrderNames] = useState(sortMetToOrderName.name);

	useEffect(() => {
		setOrderNames(sortMetToOrderName[sortMet]);
	}, [sortMet]);
	useEffect(() => {
		const property = sortMethods[sortMet];
		oninput(
			filter,
			order[0] === "n"
				? property
				: (a: GameInfo, b: GameInfo) => -property(a, b),
		);
	}, [sortMet, order, filter, oninput]);

	return (
		<div className="top-bar">
			<input
				type="text"
				style={{ backgroundColor: searchInpColor }}
				onChange={(e) => setFilter(e.target.value)}
			/>
			<span>Order by:</span>
			<select
				name="sort"
				style={{ backgroundColor: sortMetColor }}
				value={sortMet}
				onChange={(e) => setSortMet(e.target.value)}
			>
				<option value="name">Name</option>
				<option value="player">Player Count</option>
			</select>
			<select
				name="order"
				value={order}
				onChange={(e) => setOrder(e.target.value)}
				style={{ backgroundColor: orderColor }}
			>
				<option value="normal">{orderNames[0]}</option>
				<option value="reverse">{orderNames[1]}</option>
			</select>
		</div>
	);
}
