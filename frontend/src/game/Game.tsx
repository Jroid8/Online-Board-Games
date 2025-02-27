import { Outlet } from "react-router";
import LoadingCentered from "../components/LoadingCentered";
import { Playing, State, useStateStore } from "./ClientState";

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
					textAlign: "center"
				}}
			>
				{message}
			</div>
		</div>
	);
}

export default function Game() {
	const state = useStateStore((store) => store.state);
	const paused = useStateStore((store) => (store as Playing).paused);

	let game = <LoadingCentered message={"Connecting..."} />;
	switch (state) {
		case State.InGameNotStarted:
			game = (
				<Banner message="Waiting for players">
					<Outlet />
				</Banner>
			);
			break;
		case State.Playing:
			if (paused)
				game = (
					<Banner message="Paused">
						<Outlet />
					</Banner>
				);
			else game = <Outlet />;
			break;
	}
	return (
		<div css={{ flex: 1, display: "flex" }}>
			<div css={{ display: "flex", justifyContent: "center", flex: 6 }}>{game}</div>
		</div>
	);
}
