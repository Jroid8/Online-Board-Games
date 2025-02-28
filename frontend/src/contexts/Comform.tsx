import CommonModalCSS from "../utils/CommonModalCSS";
import randPastelColor from "../utils/RandPastelColor";
import PastelFloatBtn from "../components/PastelFloatBtn";

export default function Conform({
	message,
	ok,
	cancel,
	close,
}: {
	message: string;
	ok: string;
	cancel: string;
	close: (result: boolean) => void;
}) {
	return (
		<div
			css={[
				CommonModalCSS,
				{
					display: "flex",
					flexDirection: "column",
					minWidth: "50vw",
					minHeight: "25vh",
				},
			]}
			style={{ backgroundColor: randPastelColor(86).toString() }}
		>
			<p css={{ flex: 1, textAlign: "center" }}>{message}</p>
			<div css={{ display: "flex", justifyContent: "space-between" }}>
				<PastelFloatBtn
					css={{
						backgroundColor: "green",
						minWidth: "8ch",
						textAlign: "center",
						fontSize: "1.1rem"
					}}
					onClick={() => close(true)}
				>
					{ok}
				</PastelFloatBtn>
				<PastelFloatBtn
					css={{
						backgroundColor: "red",
						minWidth: "8ch",
						textAlign: "center",
						fontSize: "1.1rem"
					}}
					onClick={() => close(false)}
				>
					{cancel}
				</PastelFloatBtn>
			</div>
		</div>
	);
}
