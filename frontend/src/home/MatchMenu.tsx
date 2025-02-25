import randPastelColor from "../common/RandPastelColor";
import GameInfo from "../common/GameInfo";
import Cookies from "js-cookie";
import PastelFloatBtn from "../common/PastelFloatBtn";
import CommonModalCSS from "../modal/CommonModalCSS";
import { css } from "@emotion/react";
import { useState } from "react";
import loading from "../common/loading.svg";

const closeButtonCSS = css({
	"&&": {
		position: "absolute",
		top: "0.3em",
		right: "0.4em",
		left: "auto",
	},
	borderRadius: "50%",
	fontFamily: "sans-serif",
	fontSize: 22,
	height: "2ch",
	width: "2ch",
	display: "flex",
	justifyContent: "center",
	alignItems: "center",
});

const Spinner = () => (
	<img src={loading} css={{ height: "1em", margin: "0 0.5em" }} />
);

export default function MatchMenu({
	info,
	close,
}: {
	info: GameInfo;
	close: () => void;
}) {
	const [choice, choose] = useState(0);

	async function reqRandomMatch() {
		if (choice > 0) return;
		choose(1);
	}

	async function reqRoom() {
		if (choice > 0) return;
		choose(2);
	}

	async function inviteFriend() {
		if (choice > 0) return;
		choose(3);
	}

	return (
		<div
			css={[
				CommonModalCSS,
				{
					position: "relative",
					display: "flex",
					gap: "4ch",
					"@media (max-width: 700px)": {
						flexDirection: "column",
						alignItems: "center",
						gap: "1ch",
					},
				},
			]}
			style={{ backgroundColor: randPastelColor(86).toString() }}
		>
			<PastelFloatBtn onClick={close} css={closeButtonCSS}>
				&times;
			</PastelFloatBtn>
			<img
				src={"/thumbnails/" + info.id}
				css={{
					width: "min(55vmin, 280px)",
					height: "min(55vmin, 280px)",
					border: "1px black solid",
					"@media (max-width: 700px)": {
						width: "min(60vw, 50vh, 280px)",
						height: "min(60vw, 50vh, 280px)",
					},
				}}
			/>
			<div css={{ display: "flex", flexDirection: "column" }}>
				<h1 css={{ minWidth: "12ch", margin: "0 0 1ch 0" }}>
					Play {info.name}
				</h1>
				<div
					css={{
						display: "flex",
						justifyContent: "space-between",
						flexDirection: "column",
						flex: 1,
						gap: "2ch",
					}}
				>
					<PastelFloatBtn
						as="button"
						disabled={choice > 1}
						onClick={reqRandomMatch}
					>
						{choice == 1 ? (
							<>
								<Spinner /> Waiting for Players
							</>
						) : (
							<>Random Match</>
						)}
					</PastelFloatBtn>
					<PastelFloatBtn
						as="button"
						disabled={choice == 1 || choice == 3}
						onClick={reqRoom}
					>
						{choice == 2 ? (
							<>
								<Spinner /> Making Room
							</>
						) : (
							<>Create Invite Link</>
						)}
					</PastelFloatBtn>
					<PastelFloatBtn
						as="button"
						disabled={!Cookies.get("session") || choice == 1 || choice == 2}
						title={Cookies.get("session") ? undefined : "Requires Login"}
						onClick={inviteFriend}
					>
						{choice == 3 ? (
							<>
								<Spinner /> Waiting for Friend
							</>
						) : (
							<>Invite Friend</>
						)}
					</PastelFloatBtn>
				</div>
			</div>
		</div>
	);
}
