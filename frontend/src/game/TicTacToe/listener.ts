import { useStateStore } from "../ClientState";
import { CurrentState, markCell } from "./states";

export default function listener(msg: DataView<ArrayBuffer>) {
	const state = useStateStore.getState() as CurrentState;
	if (msg.buffer.byteLength !== 2 && msg.getUint8(0) !== 1) return;
	markCell(state, useStateStore.setState, msg.getUint8(1));
	useStateStore.setState({ myTurn: true });
}
