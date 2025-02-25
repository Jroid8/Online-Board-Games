import { GameRoom } from "../game-room";
import GameInfo from "../game-info";
import { Player } from "../player";
import TicTacToe from "./tic-tac-toe";

const gameList: (GameInfo & (new (players: Player[]) => GameRoom))[] = [
	TicTacToe,
];

export default gameList;
