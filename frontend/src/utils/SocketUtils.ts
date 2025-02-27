export async function socketFetch(
	ws: WebSocket,
	req: ArrayBufferLike,
): Promise<DataView<ArrayBuffer>> {
	return new Promise((resolve, reject) => {
		function responseHandler(ev: MessageEvent<ArrayBuffer>) {
			ws.removeEventListener("message", responseHandler);
			ws.removeEventListener("error", onError)
			ws.removeEventListener("close", onError)
			resolve(new DataView(ev.data));
		}
		function onError() {
			ws.removeEventListener("message", responseHandler)
			ws.removeEventListener("error", onError)
			ws.removeEventListener("close", onError)
			reject();
		}
		ws.addEventListener("message", responseHandler);
		ws.addEventListener("error", onError);
		ws.addEventListener("close", onError);
		ws.send(req);
	});
}
