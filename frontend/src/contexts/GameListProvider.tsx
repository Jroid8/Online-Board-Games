import { useEffect, useState } from "react";
import GameListCtx from "./GameListCtx";
import GameInfo from "../common/GameInfo";

const currentGames: GameInfo[] = [
	{
		id: 0,
		name: "Tic Tac Toe",
		urlName: "tic-tac-toe",
		playersOnline: 0,
	},
	{
		id: 1,
		name: "Checkers",
		urlName: "checkers",
		playersOnline: 1,
	},
	{
		id: 2,
		name: "Go",
		urlName: "go",
		playersOnline: 2,
	},
];
export default function GameListProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	const [gameList, gameListResolved] = useState<GameInfo[]>([]);
	
	useEffect(() => {
		setTimeout(() => {
			gameListResolved(currentGames);
		}, 500);
	}, []);

	return <GameListCtx.Provider value={gameList}>{children}</GameListCtx.Provider>;
}
