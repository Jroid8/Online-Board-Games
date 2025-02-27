import { GameRoom } from "../game-room";
import GameInfo from "../game-info";
import TicTacToe from "./tic-tac-toe";

const gameList: (GameInfo & (new () => GameRoom))[] = [
	TicTacToe,
];

export default gameList;
