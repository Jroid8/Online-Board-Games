import WebSocket from "ws";
import Room from "./room";

export interface Player {
  id: number;
  ws: WebSocket | null;
  name: string;
  isGuest: boolean;
  room: Room;
}
