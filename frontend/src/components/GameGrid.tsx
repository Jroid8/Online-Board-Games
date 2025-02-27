import GameCard from "./GameCard";
import GameInfo from "../utils/GameInfo";

export default function GameGrid({ games }: { games: GameInfo[] }) {
	return (
		<div
			css={{
				display: "grid",
				gridTemplateColumns: "repeat(auto-fit, minmax(12rem, 1fr))",
				gap: "2vmin",
				padding: 3,
			}}
		>
			{games.map((g) => (
				<GameCard key={g.id} info={g} />
			))}
		</div>
	);
}
