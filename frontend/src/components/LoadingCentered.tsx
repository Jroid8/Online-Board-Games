import loading from "/src/common/loading.svg";

export default function LoadingCentered({message}: {message: string}) {
	return <div
		css={{
			flexGrow: 1,
			display: "flex",
			alignItems: "center",
			justifyContent: "center",
			flexDirection: "column",
		}}
	>
		<img src={loading} />
		{message}
	</div>
}
