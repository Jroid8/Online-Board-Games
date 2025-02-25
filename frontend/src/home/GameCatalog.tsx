import GameInfo from "../common/GameInfo";
import GameList from "./GameList";
import SearchSortBar from "./SearchSortBar";
import { useCallback, useContext, useState } from "react";
import loading from "/src/common/loading.svg";
import GameListCtx from "../contexts/GameListCtx";

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
	const allGames = useContext(GameListCtx);
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

	return (
		<div
			css={{
				display: "flex",
				flexDirection: "column",
				height: "100%",
			}}
		>
			<SearchSortBar oninput={filterSort} />
			{allGames.length == 0 ? loadingDiv : <GameList games={gameList} />}
		</div>
	);
}
