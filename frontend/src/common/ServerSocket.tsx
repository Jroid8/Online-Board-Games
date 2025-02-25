import { useRef } from "react";
import Cookies from "js-cookie";
import ConnectionContext from "./ConnectionContext";

function establish(): WebSocket {
  const ws = new WebSocket("ws://" + location.host);
	ws.binaryType = "arraybuffer";
	return ws;
}

export default function ServerConnection({
  children,
}: {
  children: React.ReactNode;
}) {
  const connState = useRef<null | WebSocket>(
    Cookies.get("session") ? establish() : null,
  );

  function retrieve(): [WebSocket, boolean] {
		const established = !connState.current;
    if (!connState.current) connState.current = establish();
    return [connState.current, established];
  }

  return <ConnectionContext.Provider value={retrieve}>{children}</ConnectionContext.Provider>;
}
