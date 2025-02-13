import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./common/index.css";
import { BrowserRouter, Routes } from "react-router";
import { Route } from "react-router";
import Home from "./home/index.tsx";

createRoot(document.body).render(
	<StrictMode>
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<Home />} />
			</Routes>
		</BrowserRouter>
	</StrictMode>,
);
