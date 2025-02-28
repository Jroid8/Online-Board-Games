import { Outlet } from "react-router";
import ModalManager from "../contexts/ModalManager";
import NavBar from "./NavBar";

export default function RootLayout() {
	return (
		<>
			<ModalManager>
				<NavBar />
				<Outlet />
			</ModalManager>
		</>
	);
}
