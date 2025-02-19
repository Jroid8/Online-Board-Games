import { css } from "@emotion/react";
import PastelFloatBtn from "./PastelFloatBtn.tsx";
import Cookies from "js-cookie";

const linkStyle = css({
  margin: "0 0.2em",
});

const userLinks = (
  <div>
    <PastelFloatBtn css={linkStyle} as="a" href="/friends">
      Friends
    </PastelFloatBtn>
    <PastelFloatBtn css={linkStyle} as="a" href="/stats">
      Stats
    </PastelFloatBtn>
    <PastelFloatBtn css={linkStyle} as="a" href="/settings">
      Settings
    </PastelFloatBtn>
  </div>
);

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
          margin: "0.2em",
        }}
      >
        Online Board Games
      </span>
      {Cookies.get("session") && userLinks}
    </nav>
  );
}
