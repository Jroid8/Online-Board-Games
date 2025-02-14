import './GameList.css';
import GameCard from "./GameCard";
import GameInfo from "./GameInfo";

export default function GameList({ games }: { games: GameInfo[] }) {
  return (
    <div className="game-list">
      {games.map((g) => (
        <GameCard key={g.id} info={g} />
      ))}
    </div>
  );
}
