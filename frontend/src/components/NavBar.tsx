import { css } from "@emotion/react";
import PastelFloatBtn from "./PastelFloatBtn.tsx";
import Cookies from "js-cookie";
import { Link } from "react-router";
import Logo from "./Logo.tsx";

const linkStyle = css({
	fontSize: 20,
	whiteSpace: "nowrap",
});

const userLinks = (
	<>
		<PastelFloatBtn css={linkStyle} as={Link} to="/friends">
			Friends
		</PastelFloatBtn>
		<PastelFloatBtn css={linkStyle} as={Link} to="/stats">
			Stats
		</PastelFloatBtn>
		<PastelFloatBtn css={linkStyle} as={Link} to="/settings">
			Settings
		</PastelFloatBtn>
	</>
);

const loginLinks = (
	<>
		<PastelFloatBtn css={linkStyle} as={Link} to="/login">
			Login
		</PastelFloatBtn>
		<PastelFloatBtn css={linkStyle} as={Link} to="/signup">
			Sign up
		</PastelFloatBtn>
	</>
);

export default function NavBar() {
	return (
		<nav
			css={{
				display: "flex",
				justifyContent: "space-between",
				alignItems: "center",
				padding: "0 0.7ch",
			}}
		>
			<Logo />
			<div css={{ display: "flex", gap: "0.5vw" }}>
				{Cookies.get("session") ? userLinks : loginLinks}
			</div>
		</nav>
	);
}
