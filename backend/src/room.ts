import { Player } from "./player";

export default interface Room {
	onMessage(player: Player, message: Buffer): void;
	onDisconnect?(player: Player, hub: Room): void;
}
