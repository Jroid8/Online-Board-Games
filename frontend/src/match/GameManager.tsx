import { useContext, useEffect, useRef } from "react";
import { GameContext, GameState } from "./GameState";
import ConnectionContext from "../contexts/ConnectionContext";
import { useNavigate } from "react-router";
import GameListCtx from "../contexts/GameListCtx";

export default function GameManager({
	children,
}: {
	children: React.ReactNode;
}) {
	const ws = useContext(ConnectionContext)!;
	const gameList = useContext(GameListCtx);
	const navigate = useNavigate();
	const gameState = useRef(new GameState(ws, navigate));

	useEffect(() => {
		gameState.current.gameListResolved(gameList);
	}, [gameList]);

	return (
		<GameContext.Provider value={gameState.current}>
			{children}
		</GameContext.Provider>
	);
}
