import { createContext } from "react";

export default createContext<null | (() => WebSocket)>(null);
