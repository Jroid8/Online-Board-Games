import './GameCard.css';
import GameInfo from "./GameInfo";
import { useState } from 'react';
import randPastelColor from '../common/randPastelColor.ts';

export default function GameCard({ info }: { info: GameInfo }) {
	const [color] = useState(() => randPastelColor());

	return (
		<div className="game-card" style={{backgroundColor: color}}>
			<img src={info.thumbnailURL} alt={info.name + " image"}/>
			<span className="name">{info.name}</span>
			<span className="online">currently playing: {info.playersOnline.toLocaleString()}</span>
		</div>
	);
}
