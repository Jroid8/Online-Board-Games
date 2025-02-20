import randPastelColor from "../common/RandPastelColor";
import GameInfo from "../common/GameInfo";
import Cookies from "js-cookie";
import PastelFloatBtn from "../common/PastelFloatBtn";

export default function GameMenu({ info }: { info: GameInfo }) {
  return (
    <div
      css={{
        backgroundColor: randPastelColor(86).toString(),
        borderRadius: "2vmin",
        padding: "5vmin",
        display: "flex",
        gap: "6ch",
				border: "2px black solid",
				boxShadow: "4px 6px black",
      }}
    >
      <img
        src={"/thumbnails/" + info.id}
        css={{
          height: "33vmin",
          width: "33vmin",
					border: "1px black solid"
        }}
      />
      <div
        css={{
          button: {
            margin: "3vh 0",
            display: "block",
          },
        }}
      >
        <h1 css={{minWidth: "10ch"}}>Play {info.name}</h1>
        <PastelFloatBtn as="button">Random Match</PastelFloatBtn>
        <PastelFloatBtn as="button">Create Invite Link</PastelFloatBtn>
        <PastelFloatBtn
          as="button"
          disabled={!Cookies.get("session")}
          title={Cookies.get("session") ? undefined : "Requires Login"}
        >
          Invite Friend
        </PastelFloatBtn>
      </div>
    </div>
  );
}
