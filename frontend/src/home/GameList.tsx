import GameCard from "./GameCard";
import GameInfo from "../common/GameInfo";

export default function GameList({ games }: { games: GameInfo[] }) {
  return (
    <div
      css={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(12rem, 1fr))",
				gap: "2vmin"
      }}
    >
      {games.map((g) => (
        <GameCard key={g.id} info={g} />
      ))}
    </div>
  );
}
