import WebSocket from "ws";

export interface Player {
	ws: WebSocket | null;
	name: string;
}
