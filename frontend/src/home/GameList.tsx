import GameCard from "./GameCard";
import GameInfo from "./GameInfo";

export default function GameList({ games }: { games: GameInfo[] }) {
  return (
    <div
      css={{
        display: "flex",
        flexWrap: "wrap",
      }}
    >
      {games.map((g) => (
        <GameCard key={g.id} info={g} />
      ))}
    </div>
  );
}
