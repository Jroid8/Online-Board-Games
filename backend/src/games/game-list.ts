import { GameInfo, GameRoom } from "../game";
import { Player } from "../player";
import TicTacToe from "./tic-tac-toe";

const gameList: (GameInfo & (new (players: Player[]) => GameRoom))[] = [
  TicTacToe,
];

export default gameList;
