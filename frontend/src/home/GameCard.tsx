import GameInfo from "./GameInfo";

export default function GameCard({ info }: { info: GameInfo }) {
	return (
		<div className="game-card">
			<img src={info.thumbnailURL} />
			<span className="name">{info.name}</span>
			<span className="online">currently playing: {info.playersOnline.toLocaleString()}</span>
		</div>
	);
}
