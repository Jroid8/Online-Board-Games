import { createContext } from "react";

export class SocketManager {
	public ws: WebSocket | null = null;

	public connect() {
		if (this.ws && this.ws.readyState !== WebSocket.CLOSED) return;
		this.ws = new WebSocket("ws://" + location.host);
		this.ws.binaryType = "arraybuffer";
	}

	public isOpen(): this is { ws: WebSocket } {
		return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
	}

	public async waitForOpen(): Promise<WebSocket> {
		if (this.isOpen()) return this.ws;
		this.connect();
		const ws = this.ws as WebSocket;
		return new Promise((resolve, reject) => {
			ws.onopen = function onOpen() {
				resolve(ws);
				ws.onclose = ws.onerror = ws.onopen = null;
			};
			ws.onclose = (ev: CloseEvent) => {
				reject(ev.reason);
				ws.onclose = ws.onerror = ws.onopen = null;
			};
			ws.onerror = () => {
				reject();
				ws.onclose = ws.onerror = ws.onopen = null;
			};
		});
	}

	public async fetch(
		req: ArrayBufferLike,
	): Promise<DataView<ArrayBuffer>> {
		const ws = await this.waitForOpen();
		return new Promise((resolve) => {
			function responseHandler(ev: MessageEvent<ArrayBuffer>) {
				ws.removeEventListener("message", responseHandler);
				resolve(new DataView(ev.data));
			}
			ws.addEventListener("message", responseHandler);
			ws.send(req);
		});
	}
}

export const ServerConnCtx = createContext<SocketManager | null>(null);
