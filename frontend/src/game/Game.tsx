import { Outlet } from "react-router";
import LoadingCentered from "../components/LoadingCentered";
import { Playing, State, useStateStore } from "./ClientState";

function Disabled({ children }: { children: React.ReactNode }) {
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
					fontSize: "10rem",
					padding: "3ch",
					borderRadius: "3ch",
				}}
			>
				Waiting for players
			</div>
		</div>
	);
}

export default function Game() {
	const state = useStateStore((store) => store.state);
	const paused = useStateStore((store) => (store as Playing).paused);

	switch (state) {
		case State.InGameNotStarted:
			return (
				<Disabled>
					<Outlet />
				</Disabled>
			);
		case State.Playing:
			if (paused)
				return (
					<Disabled>
						<Outlet />
					</Disabled>
				);
			else return <Outlet />;
		default:
			return <LoadingCentered message={"Connecting..."} />;
	}
}
