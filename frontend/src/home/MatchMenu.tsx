import randPastelColor from "../common/RandPastelColor";
import GameInfo from "../common/GameInfo";
import Cookies from "js-cookie";
import PastelFloatBtn from "../common/PastelFloatBtn";
import CommonModalCSS from "../common/CommonModalCSS";
import { css } from "@emotion/react";

const closeButtonCSS = css({
  position: "absolute",
  top: "0.3em",
  right: "0.4em",
  borderRadius: "50%",
  fontFamily: "sans-serif",
  fontSize: 22,
  height: "1ch",
  width: "1ch",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
});

export default function MatchMenu({
  info,
  close,
}: {
  info: GameInfo;
  close: () => void;
}) {
  return (
    <div
      css={[
        CommonModalCSS,
        {
          position: "relative",
          display: "flex",
          gap: "4ch",
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
          height: "25vmin",
          width: "25vmin",
          border: "1px black solid",
        }}
      />
      <div css={{ display: "flex", flexDirection: "column" }}>
        <h1 css={{ minWidth: "10ch", margin: "0 0 1ch 0" }}>
          Play {info.name}
        </h1>
        <div
          css={{
            display: "flex",
            justifyContent: "space-between",
            flexDirection: "column",
            flex: 1,
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
