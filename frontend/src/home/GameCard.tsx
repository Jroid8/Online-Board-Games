import { Link } from "react-router";
import PastelFloatBtn from "../common/PastelFloatBtn.tsx";
import GameInfo from "../common/GameInfo";

export default function GameCard({ info }: { info: GameInfo }) {
	return (
		<PastelFloatBtn
			as={Link}
			to={"/games/" + info.id}
			css={{
				display: "flex",
				flexDirection: "column",
				justifyContent: "center",
				alignItems: "center",
				margin: "1.2vmin",
				padding: "0.7em",
			}}
		>
			<img
				css={{
					border: "1px black solid",
					width: "12rem",
					height: "12rem",
				}}
				src={"/thumbnails/" + info.id}
				alt={info.name + " thumbnail"}
			/>
			<span>{info.name}</span>
			<span css={{ fontSize: "0.8rem" }}>
				currently playing: {info.playersOnline.toLocaleString()}
			</span>
		</PastelFloatBtn>
	);
}
