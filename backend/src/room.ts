import { Player } from "./player";

export default interface Room {
	onChat(player: Player, message: Buffer): void;
	onMessage(player: Player, message: Buffer): void;
	register?(player: Player): void;
	onDisconnect?(player: Player): void;
	onRejoin?(player: Player): void;
}
