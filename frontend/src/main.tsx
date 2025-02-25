import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes } from "react-router";
import { Route } from "react-router";
import Home from "./home/index.tsx";
import randPastelColor from "./common/RandPastelColor.ts";
import NavBar from "./navbar/NavBar.tsx";
import ModalManager from "./modal/ModalManager.tsx";
import TicTacToe from "./game/TicTacToe.tsx";
import ServerConnection from "./common/ServerSocket.tsx";
import GameListProvider from "./contexts/GameListProvider.tsx";

const target = document.body;

target.style.backgroundColor = randPastelColor(96).toString();
createRoot(target).render(
	<StrictMode>
		<GameListProvider>
			<BrowserRouter>
				<ServerConnection>
					<ModalManager>
						<NavBar />
						<div css={{ flex: 1 }}>
							<Routes>
								<Route index element={<Home />} />
								<Route path="tic-tac-toe/:id" element={<TicTacToe />} />
							</Routes>
						</div>
					</ModalManager>
				</ServerConnection>
			</BrowserRouter>
		</GameListProvider>
	</StrictMode>,
);
