import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes } from "react-router";
import { Route } from "react-router";
import GameCatalog from "./components/GameCatalog.tsx";
import randPastelColor from "./utils/RandPastelColor.ts";
import NavBar from "./components/NavBar.tsx";
import ModalManager from "./contexts/ModalManager.tsx";
import GameListProvider from "./contexts/GameListProvider.tsx";

const target = document.body;

target.style.backgroundColor = randPastelColor(96).toString();
createRoot(target).render(
	<StrictMode>
		<GameListProvider>
			<BrowserRouter>
				<ModalManager>
					<NavBar />
					<div css={{ flex: 1 }}>
						<Routes>
							<Route index element={<GameCatalog />} />
						</Routes>
					</div>
				</ModalManager>
			</BrowserRouter>
		</GameListProvider>
	</StrictMode>,
);
