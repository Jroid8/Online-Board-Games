import PastelFloatBtn from "../common/PastelFloatBtn.tsx";
import GameInfo from "./GameInfo";

export default function GameCard({ info }: { info: GameInfo }) {
  return (
    <PastelFloatBtn
      css={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        margin: "1.2vmin",
				padding: "0.7em"
      }}
    >
      <img
        css={{
          border: "1px black solid",
          width: "12rem",
          height: "12rem",
        }}
        src={info.thumbnailURL}
        alt={info.name + " image"}
      />
      <span>{info.name}</span>
      <span css={{ fontSize: "0.8rem" }} className="online">
        currently playing: {info.playersOnline.toLocaleString()}
      </span>
    </PastelFloatBtn>
  );
}
