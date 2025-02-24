import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes } from "react-router";
import { Route } from "react-router";
import Home from "./home/index.tsx";
import randPastelColor from "./common/RandPastelColor.ts";
import TopBar from "./common/TopBar.tsx";
import MatchPage from "./match/index.tsx";
import ModalManager from "./common/ModalManager.tsx";

const target = document.body;

target.style.backgroundColor = randPastelColor(96).toString();
createRoot(target).render(
  <StrictMode>
    <BrowserRouter>
      <ModalManager>
        <TopBar />
        <div css={{ flex: 1 }}>
          <Routes>
            <Route index element={<Home />} />
            <Route path="match/:id" element={<MatchPage />} />
          </Routes>
        </div>
      </ModalManager>
    </BrowserRouter>
  </StrictMode>,
);
