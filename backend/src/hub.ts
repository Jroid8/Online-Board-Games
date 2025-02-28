import { GameRoom } from "./game-room";
import gameList from "./games/game-list";
import addToQueue from "./match-making";
import { Player } from "./player";
import Room from "./room";

const hubMsgCodes = Object.freeze({
	joinRoomWithCode: 0x10,
	joinMatchMaking: 0x11,
	createRoom: 0x12,
	joinWithParty: 0x13,

	createParty: 0xf1,
	acceptParty: 0xf2,
	rejectParty: 0xf3,
});

globalThis.rooms = new Map();

export default class Hub implements Room {
	onMessage(player: Player, msg: Buffer): void {
		if (msg.length <= 1) return;
		const gameID = msg[1];
		switch (msg[0]) {
			case hubMsgCodes.joinRoomWithCode:
				{
					if (msg.length < 9) return;
					let room = globalThis.rooms.get(msg.readBigInt64BE(1)) as
						| GameRoom
						| undefined;
					if (room) room.register(player);
				}
				break;
			case hubMsgCodes.joinMatchMaking:
				addToQueue(player, gameID);
				break;
			case hubMsgCodes.createRoom: {
				if (gameID >= gameList.length) return;
				let room = new gameList[gameID]();
				room.register(player);
				rooms.set(room.id, room);
				break;
			}
		}
	}

	onChat(player: Player, message: Buffer): void {
		const recipient = globalThis.onlinePlayers.get(message.readUint32BE(1));
		if (recipient.ws) {
			message.writeUInt32BE(player.id, 1);
			recipient.ws.send(message);
		}
	}
}
