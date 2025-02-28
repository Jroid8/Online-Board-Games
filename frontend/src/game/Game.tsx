import { Outlet, useParams } from "react-router";
import LoadingCentered from "../components/LoadingCentered";
import { Playing, State, useStateStore } from "./ClientState";
import { useBlocker } from "react-router";
import { useContext, useEffect, useState } from "react";
import ModalContext from "../contexts/ModalContext";
import Conform from "../contexts/Comform";
import randPastelColor from "../utils/RandPastelColor";

function Banner({
	message,
	children,
}: {
	message: string;
	children: React.ReactNode;
}) {
	return (
		<div
			css={{
				pointerEvents: "none",
				position: "relative",
			}}
		>
			{children}
			<div
				css={{
					position: "absolute",
					top: "50%",
					left: "50%",
					transform: "translate(-50%, -50%)",
					background: "rgba(0, 0, 0, 0.7)",
					color: "white",
					fontSize: "8vmin",
					padding: "3ch",
					borderRadius: "3ch",
					textAlign: "center",
				}}
			>
				{message}
			</div>
		</div>
	);
}

export default function Game() {
	const state = useStateStore((store) => store.state);
	const forfeit = useStateStore((store) => store.forfeit);
	const joinMatch = useStateStore((store) => store.joinMatch);
	const { id } = useParams();
	const paused = useStateStore((store) => (store as Playing).paused);
	const players = useStateStore((store) => (store as Playing).players);
	const winner = useStateStore((store) => (store as Playing).winner);
	const blocker = useBlocker(() => state === State.Playing && winner === null);
	const showModal = useContext(ModalContext)!;
	const [modalShown, setModalShown] = useState(false);

	useEffect(() => {
		if (blocker.state === "blocked" && !modalShown)
			showModal<boolean>((close) => {
				setModalShown(true);
				return (
					<Conform
						message="Are you sure you want to forfeit this match?"
						ok="Yes"
						cancel="No"
						close={close}
					/>
				);
			})
				.then((r) => {
					if (r) {
						blocker.proceed!();
						forfeit();
					} else blocker.reset!();
				})
				.finally(() => setModalShown(false));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [blocker]);

	useEffect(() => {
		if (state === State.InGameNotStarted || state === State.Playing) return;
		joinMatch(0, BigInt(id!));
	}, [state, id, joinMatch]);

	let game = <LoadingCentered message={"Connecting..."} />;
	if (state === State.InGameNotStarted) {
		game = (
			<Banner message="Waiting for players">
				<Outlet />
			</Banner>
		);
	} else if (state === State.Playing) {
		if (paused)
			game = (
				<Banner message="Paused">
					<Outlet />
				</Banner>
			);
		else if (winner)
			game = (
				<Banner message={winner.name + " wins!"}>
					<Outlet />
				</Banner>
			);
		else game = <Outlet />;
	}
	return (
		<div css={{ flex: 1, display: "flex" }}>
			<div css={{ display: "flex", justifyContent: "center", flex: 6 }}>
				{game}
			</div>
			<div
				css={{ minWidth: "20em", flexShrink: 0 }}
				style={{ backgroundColor: randPastelColor().toString() }}
			>
				<h4>Players</h4>
				<ul>{players && players.map((p) => <li key={p.id}>{p.name}</li>)}</ul>
			</div>
		</div>
	);
}
