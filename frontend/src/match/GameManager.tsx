import { useContext } from "react";
import { GameContext, GameState } from "./GameState";
import ConnectionContext from "../contexts/ConnectionContext";
import { useNavigate } from "react-router";

export default function GameManager({children}: {children: React.ReactNode}) {
	const ws = useContext(ConnectionContext)!;
	const navigate = useNavigate();

	return <GameContext.Provider value={new GameState(ws, navigate)}>
	{children}
	</GameContext.Provider>
}
