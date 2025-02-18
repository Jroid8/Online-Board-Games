import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes } from "react-router";
import { Route } from "react-router";
import Home from "./home/index.tsx";
import randPastelColor from "./common/RandPastelColor.ts";
import TopBar from "./common/TopBar.tsx";

const target = document.body;

target.style.backgroundColor = randPastelColor(96);
createRoot(target).render(
	<StrictMode>
		<TopBar />
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<Home />} />
			</Routes>
		</BrowserRouter>
	</StrictMode>,
);
