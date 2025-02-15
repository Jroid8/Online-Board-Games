import GameInfo from "./GameInfo";
import "./GameCatalog.css";
import GameList from "./GameList";
import SearchSortBar from "./SearchSortBar";
import { useCallback, useEffect, useRef, useState } from "react";
import loading from "/src/common/loading.svg";

const currentGames: GameInfo[] = [
	{
		id: 0,
		name: "Tic-Tac-Toe",
		thumbnailURL: "localhost",
		playersOnline: 0,
	},
	{
		id: 1,
		name: "Checkers",
		thumbnailURL: "localhost",
		playersOnline: 1,
	},
	{
		id: 2,
		name: "Go",
		thumbnailURL: "localhost",
		playersOnline: 2,
	},
];
const loadingList: GameInfo[] = [];
const loadingDiv = (
	<div className="game-list-loading">
		<img src={loading} />
		Loading Games...
	</div>
);

export default function GameCatalog() {
	const [allGames, gameListResolved] = useState(loadingList);
	const [gameList, setGameList] = useState(allGames);

	const filterSort = useCallback(
		(filter: string, sortMet: (a: GameInfo, b: GameInfo) => number) => {
			console.log("sort");
			setGameList(
				[...allGames]
					.filter(
						(e) =>
							e.name.toLocaleLowerCase().indexOf(filter.toLocaleLowerCase()) >=
							0,
					)
					.sort(sortMet),
			);
		},
		[allGames],
	);

	useEffect(() => {
		setTimeout(() => {
			gameListResolved(currentGames);
		}, 500);
	}, []);

	return (
		<div className="catalog">
			<SearchSortBar oninput={filterSort} />
			{gameList.length == 0 ? loadingDiv : <GameList games={gameList} />}
		</div>
	);
}
