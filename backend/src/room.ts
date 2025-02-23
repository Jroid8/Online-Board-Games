import { Player } from "./player";

export default interface Room {
	onMessage(player: Player, message: Buffer): void;
	register?(player: Player): void;
	onDisconnect?(player: Player, hub: Room): void;
	onRejoin?(player: Player): void;
}
