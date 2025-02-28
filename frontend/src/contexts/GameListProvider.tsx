import { useEffect, useState } from "react";
import GameListCtx from "./GameListCtx";
import GameInfo from "../utils/GameInfo";

export default function GameListProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	const [gameList, gameListResolved] = useState<GameInfo[]>([]);

	useEffect(() => {
		fetch("http://localhost:8080/game-list")
			.then((res) => res.json())
			.then((res) => gameListResolved(res));
	}, []);

	return (
		<GameListCtx.Provider value={gameList}>{children}</GameListCtx.Provider>
	);
}
