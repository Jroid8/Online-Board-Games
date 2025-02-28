import MsgCodes from "../../utils/MessageCodes";
import { useStateStore } from "../ClientState";
import { Cell, CurrentState, markCell } from "./states";

export default function listener(msg: DataView<ArrayBuffer>) {
	const state = useStateStore.getState() as CurrentState;
	if (msg.buffer.byteLength < 2) return;
	if (msg.getUint8(0) === 1) {
		markCell(
			state,
			useStateStore.setState,
			msg.getUint8(5),
			msg.getUint32(1) === state.xPlayer ? Cell.X : Cell.O,
		);
	} else if (
		msg.getUint8(0) === MsgCodes.game.playerTurn &&
		msg.buffer.byteLength === 5
	) {
		const id = msg.getUint32(1);
		useStateStore.setState({ turn: id, myTurn: id === state.user.id });
	}
}
