import { css } from "@emotion/react";
import PastelFloatBtn from "./PastelFloatBtn.tsx";
import Logo from "./Logo.tsx";
import { useContext } from "react";
import ModalContext from "../contexts/ModalContext.ts";
import CommonModalCSS from "../utils/CommonModalCSS.ts";
import randPastelColor from "../utils/RandPastelColor.ts";
import { InHub, State, useStateStore } from "../game/ClientState.ts";

const linkStyle = css({
	fontSize: 20,
	whiteSpace: "nowrap",
});

export default function NavBar() {
	const showModal = useContext(ModalContext)!;
	const isLoggedIn = useStateStore(
		(state) => state.state !== State.Disconnected && !!(state as InHub).user,
	);

	async function showDialog(action: string): Promise<[string, string] | null> {
		const fd = await showModal<FormData | null>((close) => {
			return (
				<form
					action={(fd) => close(fd)}
					css={[
						CommonModalCSS,
						{
							display: "flex",
							flexDirection: "column",
							fontSize: "1.3rem",
							gap: "0.8ch",
							width: "25em",
							label: {
								display: "flex",
								justifyContent: "space-between",
								alignItems: "center",
								input: {
									width: "min(20ch, 60vw)",
									fontSize: "inherit",
									border: "2px black solid",
									borderRadius: "0.6ch",
									padding: "0.2ch",
								},
							},
						},
					]}
					style={{ backgroundColor: randPastelColor(86).toString() }}
				>
					<label>
						Username:
						<input type="text" name="user" />
					</label>
					<label>
						Password:
						<input type="password" name="pass" />
					</label>
					<div
						css={{
							display: "flex",
							justifyContent: "space-between",
							marginTop: "1.5ch",
						}}
					>
						<PastelFloatBtn
							as="button"
							onClick={(e) => {
								e.preventDefault();
								close(null);
							}}
						>
							Cancel
						</PastelFloatBtn>
						<PastelFloatBtn as="input" type="submit" value={action} />
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
		const res = await fetch("http://localhost:8080/signin", {
			method: "POST",
			headers: { "Content-Type": "text/plain" },
			body: input[0] + ":" + input[1],
		});
		if (res.ok) useStateStore.getState().connect();
		else if (res.status === 430) {
			alert("Username already exists");
		} else {
			alert("Could not sign in");
		}
	}

	async function login() {
		const input = await showDialog("Login");
		if (!input) return;
		const res = await fetch("http://localhost:8080/login", {
			method: "POST",
			headers: { "Content-Type": "text/plain" },
			body: input[0] + ":" + input[1],
		});
		if (res.ok) useStateStore.getState().connect();
		else if (res.status === 401) {
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
			<PastelFloatBtn css={linkStyle} onClick={login}>
				Login
			</PastelFloatBtn>
			<PastelFloatBtn css={linkStyle} onClick={signin}>
				Sign up
			</PastelFloatBtn>
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
				{isLoggedIn ? userLinks : loginLinks}
			</div>
		</nav>
	);
}
