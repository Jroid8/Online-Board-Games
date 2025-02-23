import { Player } from "./player";

export default interface Room {
	onMessage(player: Player, message: Buffer): void;
	register?(player: Player): void;
	onDisconnect?(player: Player): void;
	onRejoin?(player: Player): void;
}
