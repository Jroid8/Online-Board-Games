import { RawData } from "ws";
import { Player } from "./player";

export default interface Room {
	onMessage(player: Player, message: Buffer): void;
}
