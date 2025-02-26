export async function socketFetch(
	ws: WebSocket,
	req: ArrayBufferLike,
): Promise<DataView<ArrayBuffer>> {
	return new Promise((resolve) => {
		function responseHandler(ev: MessageEvent<ArrayBuffer>) {
			ws.removeEventListener("message", responseHandler);
			resolve(new DataView(ev.data));
		}
		ws.addEventListener("message", responseHandler);
		ws.send(req);
	});
}
