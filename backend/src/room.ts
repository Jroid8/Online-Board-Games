import { RawData } from "ws";
import { Player } from "./player";

export default interface Room {
	handle(player: Player, socketData: RawData): void;
}
