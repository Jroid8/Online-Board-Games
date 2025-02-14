import './GameCard.css';
import GameInfo from "./GameInfo";
import randomPastelColor from '../common/randPastelColor.ts';

export default function GameCard({ info }: { info: GameInfo }) {
	return (
		<div className="game-card" style={{backgroundColor: randomPastelColor()}}>
			<img src={info.thumbnailURL} alt={info.name + " image"}/>
			<span className="name">{info.name}</span>
			<span className="online">currently playing: {info.playersOnline.toLocaleString()}</span>
		</div>
	);
}
