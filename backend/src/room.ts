import { RawData } from "ws";

export default interface Room {
	handle(socketData: RawData): void;
}
