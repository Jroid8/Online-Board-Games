import PastelFloatBtn from "../common/PastelFloatBtn.tsx";
import GameInfo from "../common/GameInfo";
import { useContext } from "react";
import ModalContext from "../modal/ModalContext.ts";
import MatchMenu from "./MatchMenu.tsx";

export default function GameCard({ info }: { info: GameInfo }) {
	const showModal = useContext(ModalContext)!;

	function clicked() {
		showModal((close) => <MatchMenu info={info} close={() => close(null)} />);
	}

	return (
		<PastelFloatBtn
			as="button"
			onClick={clicked}
			css={{
				display: "flex",
				flexDirection: "column",
				justifyContent: "center",
				alignItems: "center",
				padding: "0.7em",
			}}
		>
			<img
				css={{
					border: "1px black solid",
					width: "10rem",
					height: "10rem",
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
