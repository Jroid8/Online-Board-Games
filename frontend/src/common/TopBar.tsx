import PastelFloatBtn from "./PastelFloatBtn.tsx";

export default function TopBar() {
	return (
		<nav
			css={{
				display: "flex",
				justifyContent: "space-between",
				alignItems: "center",
			}}
		>
			<span
				css={{
					fontSize: "24pt",
					margin: "0.2em"
				}}
			>
				Online Board Games
			</span>
			<div>
				<PastelFloatBtn
					as="a"
					href="/friends"
					css={{
						padding: "0.4em",
					}}
				>
					Friends
				</PastelFloatBtn>
			</div>
		</nav>
	);
}
