import { css } from "@emotion/react";
import PastelFloatBtn from "./PastelFloatBtn.tsx";
import Cookies from "js-cookie";
import randPastelColor from "./RandPastelColor.ts";
import { Link, useNavigate } from "react-router";

const linkStyle = css({
  margin: "0 0.2em",
  fontSize: 20,
  whiteSpace: "nowrap",
});

const userLinks = (
  <div>
    <PastelFloatBtn css={linkStyle} as={Link} to="/friends">
      Friends
    </PastelFloatBtn>
    <PastelFloatBtn css={linkStyle} as={Link} to="/stats">
      Stats
    </PastelFloatBtn>
    <PastelFloatBtn css={linkStyle} as={Link} to="/settings">
      Settings
    </PastelFloatBtn>
  </div>
);

const loginLinks = (
  <div>
    <PastelFloatBtn css={linkStyle} as={Link} to="/login">
      Login
    </PastelFloatBtn>
    <PastelFloatBtn css={linkStyle} as={Link} to="/signup">
      Sign up
    </PastelFloatBtn>
  </div>
);

export default function TopBar() {
  const navigate = useNavigate();

  return (
    <nav
      css={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
				padding: "0 0.7ch"
      }}
    >
      <svg height="70" width="620" xmlns="http://www.w3.org/2000/svg">
        <text
          x="0"
          y="60"
          css={{ fontSize: 60, fontWeight: "bold", cursor: "pointer" }}
          onClick={() => navigate("/")}
        >
          {"Online Board Games".split("").map((c, i) => (
            <tspan
              key={i}
              fill={randPastelColor().toString()}
              stroke="#333"
              strokeWidth="2"
            >
              {c}
            </tspan>
          ))}
        </text>
      </svg>
      {Cookies.get("session") ? userLinks : loginLinks}
    </nav>
  );
}
