import GameInfo from "../utils/GameInfo";
import GameGrid from "./GameGrid";
import SearchSortBar from "./SearchSortBar";
import { useCallback, useContext, useState } from "react";
import GameListCtx from "../contexts/GameListCtx";
import LoadingCentered from "./LoadingCentered";

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
			{allGames.length == 0 ? (
				<LoadingCentered message={"Loading Games ..."} />
			) : (
				<GameGrid games={gameList} />
			)}
		</div>
	);
}
