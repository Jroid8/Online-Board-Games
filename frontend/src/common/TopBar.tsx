import { css } from "@emotion/react";
import PastelFloatBtn from "./PastelFloatBtn.tsx";
import Cookies from "js-cookie";
import randPastelColor from "./RandPastelColor.ts";
import { Link } from "react-router";

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

const titleElem = (
	<svg height="70" width="620" xmlns="http://www.w3.org/2000/svg">
		<text x="0" y="60" css={{ fontSize: 60, fontWeight: "bold" }}>
			{"Online Board Games".split("").map((c, i) => (
				<tspan key={i} fill={randPastelColor()} stroke="#333" strokeWidth="2">
					{c}
				</tspan>
			))}
		</text>
	</svg>
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
			{titleElem}
			{Cookies.get("session") ? userLinks : loginLinks}
		</nav>
	);
}
