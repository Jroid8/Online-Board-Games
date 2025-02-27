import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes } from "react-router";
import { Route } from "react-router";
import GameCatalog from "./components/GameCatalog.tsx";
import randPastelColor from "./utils/RandPastelColor.ts";
import NavBar from "./components/NavBar.tsx";
import ModalManager from "./contexts/ModalManager.tsx";
import GameListProvider from "./contexts/GameListProvider.tsx";
import Game from "./game/Game.tsx";
import TicTacToe from "./game/TicTacToe/component.tsx";

const target = document.body;

target.style.backgroundColor = randPastelColor(96).toString();
createRoot(target).render(
	<StrictMode>
		<GameListProvider>
			<BrowserRouter>
				<ModalManager>
					<NavBar />
					<Routes>
						<Route index element={<GameCatalog />} />
						<Route path="game" element={<Game />}>
							<Route path="tic-tac-toe" element={<TicTacToe />} />
						</Route>
					</Routes>
				</ModalManager>
			</BrowserRouter>
		</GameListProvider>
	</StrictMode>,
);
