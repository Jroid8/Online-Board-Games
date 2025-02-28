import log from "loglevel";
import gameList from "./games/game-list";
import { Player } from "./player";

const queue: Player[][] = Array.from({ length: gameList.length }, () => []);

function matchMake(gameID: number) {
	queue[gameID] = queue[gameID].filter((p) => p.ws);
	const gameQueue = queue[gameID];
	const game = gameList[gameID];
	while (gameQueue.length >= game.playerCount) {
		let room = new game();
		const players = gameQueue.splice(-game.playerCount, game.playerCount);
		room.addPlayers(players);
		globalThis.rooms.set(room.id, room);
		log.trace(players.map(p => `<${p}> `) +"where matched together")
	}
}

export default function addToQueue(player: Player, gameID: number) {
	log.trace(`<${player.id}> joined the match making queue`)
	if (gameID >= gameList.length) return;
	queue[gameID].push(player);
	setImmediate(() => matchMake(gameID));
}
