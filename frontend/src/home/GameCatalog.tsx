import GameInfo from "../common/GameInfo";
import GameList from "./GameList";
import SearchSortBar from "./SearchSortBar";
import { useCallback, useEffect, useState } from "react";
import loading from "/src/common/loading.svg";

const currentGames: GameInfo[] = [
	{
		id: 0,
		name: "Tic-Tac-Toe",
		playersOnline: 0,
	},
	{
		id: 1,
		name: "Checkers",
		playersOnline: 1,
	},
	{
		id: 2,
		name: "Go",
		playersOnline: 2,
	},
];
const loadingList: GameInfo[] = [];
const loadingDiv = (
	<div
		css={{
			flexGrow: 1,
			display: "flex",
			alignItems: "center",
			justifyContent: "center",
			flexDirection: "column",
		}}
	>
		<img src={loading} />
		Loading Games...
	</div>
);

export default function GameCatalog() {
	const [allGames, gameListResolved] = useState(loadingList);
	const [gameList, setGameList] = useState(allGames);

	const filterSort = useCallback(
		(filter: string, sortMet: (a: GameInfo, b: GameInfo) => number) => {
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
		<div
			css={{
				display: "flex",
				flexDirection: "column",
				height: "100vh",
				flex: 1,
			}}
		>
			<SearchSortBar oninput={filterSort} />
			{allGames.length == 0 ? loadingDiv : <GameList games={gameList} />}
		</div>
	);
}
