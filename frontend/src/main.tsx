import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes } from "react-router";
import { Route } from "react-router";
import Home from "./home/index.tsx";
import randPastelColor from "./common/RandPastelColor.ts";
import NavBar from "./navbar/NavBar.tsx";
import ModalManager from "./common/ModalManager.tsx";
import TicTacToe from "./game/TicTacToe.tsx";

const target = document.body;

target.style.backgroundColor = randPastelColor(96).toString();
createRoot(target).render(
  <StrictMode>
    <BrowserRouter>
      <ModalManager>
        <NavBar />
        <div css={{ flex: 1 }}>
          <Routes>
            <Route index element={<Home />} />
            <Route path="tic-tac-toe/:id" element={<TicTacToe />} />
          </Routes>
        </div>
      </ModalManager>
    </BrowserRouter>
  </StrictMode>,
);
