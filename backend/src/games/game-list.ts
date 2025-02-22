import { GameInfo } from "../game";
import TicTacToe from "./tic-tac-toe";

const gameList: GameInfo[] = [
  { id: 0, playerCount: 2, gameName: "Tic-Tac-Toe", roomImpl: TicTacToe },
];

export default gameList;
