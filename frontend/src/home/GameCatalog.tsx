import GameInfo from "./GameInfo";
import "./GameCatalog.css";
import GameList from "./GameList";
import SearchSortBar from "./SearchSortBar";
import { useEffect, useState } from "react";
import loading from "/src/common/loading.svg";

const currentGames: GameInfo[] = [
  {
    id: 0,
    name: "Tic-Tac-Toe",
    thumbnailURL: "localhost",
    playersOnline: 0,
  },
  {
    id: 1,
    name: "Checkers",
    thumbnailURL: "localhost",
    playersOnline: 0,
  },
  {
    id: 2,
    name: "Go",
    thumbnailURL: "localhost",
    playersOnline: 0,
  },
];
const loadingList: GameInfo[] = [];
const loadingDiv = (
  <div className="game-list-loading">
    <img src={loading} />
		Loading Games...
  </div>
);

export default function GameCatalog() {
  const [games, setGames] = useState(loadingList);

  useEffect(() => {
  	setTimeout(() => {
  		setGames(currentGames)
  	}, 100)
  },[])

  return (
    <div className="catalog">
      <SearchSortBar gameList={games} setGameList={setGames} />
      {games.length == 0 ? loadingDiv : <GameList games={games} />}
    </div>
  );
}
