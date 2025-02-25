export {};

declare global {
  var hub: Room;
	var onlinePlayers: Map<number, Player>;
	var rooms: Map<bigint, GameRoom>;
}
