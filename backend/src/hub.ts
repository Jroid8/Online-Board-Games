import gameList from "./games/game-list";
import addToQueue from "./match-making";
import { Player } from "./player";
import Room from "./room";

export default class Hub implements Room {
  onMessage(player: Player, msg: Buffer): void {
    if (msg.length <= 1) return;
    const gameID = msg[1];
    switch (msg[0]) {
      case 101:
				addToQueue(player, gameID);
        break;
      case 102:
				if (gameID >= gameList.length) return;
				let room = new gameList[gameID].roomImpl();
				room.addPlayer(player);
        break;
      case 103:
        const friend = msg.readUInt32BE(2);
        // check if they're actually friend
				// then invite friend
    }
  }
}
