import { css } from "@emotion/react";
import PastelFloatBtn from "./PastelFloatBtn.tsx";
import Cookies from "js-cookie";
import Logo from "./Logo.tsx";
import { useContext } from "react";
import ModalContext from "../contexts/ModalContext.ts";

const linkStyle = css({
	fontSize: 20,
	whiteSpace: "nowrap",
});

export default function NavBar() {
	const showModal = useContext(ModalContext)!;

	async function showDialog(action: string): Promise<[string, string] | null> {
		const fd = await showModal<FormData | null>((close) => {
			return (
				<form
					action={(fd) => close(fd)}
					css={{
						display: "flex",
						flexDirection: "column",
						label: {
							display: "flex",
							justifyContent: "space-between",
							gap: "1em",
							input: {
								flex: 1,
							},
						},
					}}
				>
					<label>
						Username:
						<input type="text" name="user" />
					</label>
					<label>
						Password:
						<input type="password" name="pass" />
					</label>
					<div css={{ display: "flex", justifyContent: "space-between" }}>
						<input type="submit" value={action} />
						<button onClick={() => close(null)}>Cancel</button>
					</div>
				</form>
			);
		});
		if (!fd) return null;
		else return [fd.get("user") as string, fd.get("pass") as string];
	}

	async function signin() {
		const input = await showDialog("Signin");
		if (!input) return;
		const res = await fetch(location.origin + "/signin", {
			method: "POST",
			headers: { "Content-Type": "text/plain" },
			body: input[0] + input[1],
		});
		if (res.status === 430) {
			alert("Username already exists");
		} else {
			alert("Could not sign in");
		}
	}

	async function login() {
		const input = await showDialog("Login");
		if (!input) return;
		const res = await fetch(location.origin + "/login", {
			method: "POST",
			headers: { "Content-Type": "text/plain" },
			body: input[0] + input[1],
		});
		if (res.status === 401) {
			alert("Invalid username or password");
		} else {
			alert("Could not log in");
		}
	}

	const userLinks = (
		<>
			<PastelFloatBtn css={linkStyle}>Friends</PastelFloatBtn>
			<PastelFloatBtn css={linkStyle}>Stats</PastelFloatBtn>
			<PastelFloatBtn css={linkStyle}>Settings</PastelFloatBtn>
		</>
	);

	const loginLinks = (
		<>
			<PastelFloatBtn css={linkStyle} onClick={login}>Login</PastelFloatBtn>
			<PastelFloatBtn css={linkStyle} onClick={signin}>Sign up</PastelFloatBtn>
		</>
	);

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
