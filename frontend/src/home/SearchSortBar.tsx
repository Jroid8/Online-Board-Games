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
	const [searchInpColor] = useState(() => randPastelColor());
	const [sortMetColor] = useState(() => randPastelColor());
	const [orderColor] = useState(() => randPastelColor());
	const [filter, setFilter] = useState("");
	const sortMet = useRef<null | HTMLSelectElement>(null);
	const [order, setOrder] = useState("nomral");
	const [orderNames, setOrderNames] = useState(sortMetToOrderName.name);

	function onSortMetChanged() {
		setOrderNames(sortMetToOrderName[sortMet.current!.value]);
	}

	useEffect(() => {
		const property = sortMet.current!.value;
		const compareFn =
			order[0] === "n"
				? sortMethods[property]
				: (a: GameInfo, b: GameInfo) => -sortMethods[property](a, b);
		setGameList(
			[...wholeGameList]
				.filter(
					(e) =>
						e.name.toLocaleLowerCase().indexOf(filter.toLocaleLowerCase()) >= 0,
				)
				.sort(compareFn),
		);
	}, [sortMet, order, setGameList, wholeGameList, filter]);

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
				ref={sortMet}
				onChange={onSortMetChanged}
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
