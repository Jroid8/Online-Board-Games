import Cookies from "js-cookie";
import { ServerConnCtx, SocketManager } from "./SocketManager";

export default function ServerSocket({
	children,
}: {
	children: React.ReactNode;
}) {
	const manager = new SocketManager();
	if (Cookies.get("session")) manager.connect();

	return (
		<ServerConnCtx.Provider value={manager}>
			{children}
		</ServerConnCtx.Provider>
	);
}
