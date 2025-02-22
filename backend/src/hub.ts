import { Player } from "./player";
import Room from "./room";

export default class Hub implements Room {
	onMessage(player: Player, message: Buffer): void {
		switch (message[0]) {
		}
	}
}
