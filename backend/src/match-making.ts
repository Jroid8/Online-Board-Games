import gameList from "./games/game-list";
import { Player } from "./player";

const queue: Player[][] = Array.from({ length: gameList.length }, () => []);

function matchMake(gameID: number) {
	queue[gameID] = queue[gameID].filter((p) => p.ws);
	const gameQueue = queue[gameID];
	const game = gameList[gameID];
	while (gameQueue.length >= game.playerCount) {
		let room = new game(gameQueue.splice(-game.playerCount, game.playerCount));
		globalThis.rooms.set(room.id, room);
	}
}

export default function addToQueue(player: Player, gameID: number) {
	if (gameID >= gameList.length) return;
	queue[gameID].push(player);
	setImmediate(() => matchMake(gameID));
}
