import WebSocket from "ws";

export interface Player {
	id: number;
	ws: WebSocket | null;
	name: string;
	isGuest: boolean;
}
