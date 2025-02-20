import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes } from "react-router";
import { Route } from "react-router";
import Home from "./home/index.tsx";
import randPastelColor from "./common/RandPastelColor.ts";
import TopBar from "./common/TopBar.tsx";
import GamePage from "./game/index.tsx";

const target = document.body;

target.style.backgroundColor = randPastelColor(96).toString();
createRoot(target).render(
	<StrictMode>
		<BrowserRouter>
			<TopBar />
			<Routes>
				<Route index element={<Home />} />
				<Route path="game/:id" element={<GamePage />} />
			</Routes>
		</BrowserRouter>
	</StrictMode>,
);
