import GameMenu from "./GameMenu";

export default function GamePage() {
	return (
		<div
			css={{
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				flex: 1,
			}}
		><GameMenu info={{id: 1, name: "Go", playersOnline: 0}}></GameMenu></div>
	);
}
