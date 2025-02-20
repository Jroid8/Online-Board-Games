import randPastelColor from "../common/RandPastelColor";
import GameInfo from "../common/GameInfo";
import Cookies from "js-cookie";
import PastelFloatBtn from "../common/PastelFloatBtn";

export default function GameMenu({ info }: { info: GameInfo }) {
  return (
    <div
      css={{
        backgroundColor: randPastelColor().toString(),
        borderRadius: "2vmin",
        padding: "5vmin",
        display: "flex",
        gap: "4vw",
      }}
    >
      <img
        src={"/thumbnails/" + info.id}
        css={{
          height: "33vmin",
          width: "33vmin",
        }}
      />
      <div>
        <h1>Play {info.name}</h1>
        <div
          css={{
            height: "50%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
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
    </div>
  );
}
