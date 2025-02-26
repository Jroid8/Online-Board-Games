import { useContext, useEffect, useRef } from "react";
import { GameContext, GameState } from "./GameState";
import {ServerConnCtx} from "../contexts/SocketManager";
import { useNavigate } from "react-router";
import GameListCtx from "../contexts/GameListCtx";

export default function GameManager({
	children,
}: {
	children: React.ReactNode;
}) {
	const socketManager = useContext(ServerConnCtx)!;
	const gameList = useContext(GameListCtx);
	const navigate = useNavigate();
	const gameState = useRef(new GameState(socketManager, navigate));

	useEffect(() => {
		gameState.current.gameListResolved(gameList);
	}, [gameList]);

	return (
		<GameContext.Provider value={gameState.current}>
			{children}
		</GameContext.Provider>
	);
}
