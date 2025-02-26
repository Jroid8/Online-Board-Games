import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes } from "react-router";
import { Route } from "react-router";
import Home from "./home/index.tsx";
import randPastelColor from "./common/RandPastelColor.ts";
import NavBar from "./navbar/NavBar.tsx";
import ModalManager from "./modal/ModalManager.tsx";
import ServerSocket from "./contexts/ServerSocket.tsx";
import GameListProvider from "./contexts/GameListProvider.tsx";
import GameManager from "./match/GameManager.tsx";

const target = document.body;

target.style.backgroundColor = randPastelColor(96).toString();
createRoot(target).render(
	<StrictMode>
		<GameListProvider>
			<BrowserRouter>
				<ServerSocket>
					<GameManager>
						<ModalManager>
							<NavBar />
							<div css={{ flex: 1 }}>
								<Routes>
									<Route index element={<Home />} />
								</Routes>
							</div>
						</ModalManager>
					</GameManager>
				</ServerSocket>
			</BrowserRouter>
		</GameListProvider>
	</StrictMode>,
);
