import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter } from "react-router";
import GameCatalog from "./components/GameCatalog.tsx";
import randPastelColor from "./utils/RandPastelColor.ts";
import GameListProvider from "./contexts/GameListProvider.tsx";
import Game from "./game/Game.tsx";
import TicTacToe from "./game/TicTacToe/component.tsx";
import { RouterProvider } from "react-router/dom";
import RootLayout from "./components/RootLayout.tsx";

const target = document.body;

const router = createBrowserRouter([
	{
		path: "/",
		element: <RootLayout />,
		children: [
			{
				index: true,
				element: <GameCatalog />,
			},
			{
				path: "game",
				element: <Game />,
				children: [
					{
						path: "tic-tac-toe/:id",
						element: <TicTacToe />,
					},
				],
			},
		],
	},
]);

target.style.backgroundColor = randPastelColor(96).toString();
createRoot(target).render(
	<StrictMode>
		<GameListProvider>
			<RouterProvider router={router} />
		</GameListProvider>
	</StrictMode>,
);
