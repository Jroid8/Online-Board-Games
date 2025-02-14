import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./common/index.css";
import { BrowserRouter, Routes } from "react-router";
import { Route } from "react-router";
import Home from "./home/index.tsx";
import randPastelColor from "./common/randPastelColor.ts";

const target = document.body;

target.style.backgroundColor = randPastelColor(96);
createRoot(target).render(
	<StrictMode>
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<Home />} />
			</Routes>
		</BrowserRouter>
	</StrictMode>,
);
