import { ReactNode, useState } from "react";
import ModalContext from "./ModalContext";

export default function ModalManager({
	children,
}: {
	children: React.ReactNode;
}) {
	const [queue, setQueue] = useState<React.ReactNode[]>([]);

	function addToQueue<T>(
		content: (close: (value: T) => void) => ReactNode,
	): Promise<T> {
		return new Promise<T>((resolve) => {
			const c = content((value) => {
				setQueue((q) => q.slice(1));
				resolve(value);
			});
			setQueue((q) => [...q, c]);
		});
	}

	return (
		<>
			{queue[0] && (
				<div
					css={{
						zIndex: 1,
						position: "fixed",
						left: 0,
						top: 0,
						width: "100%",
						height: "100%",
						backgroundColor: "rgba(0,0,0,0.4)",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
					}}
				>
					{queue[0]}
				</div>
			)}
			<ModalContext.Provider value={addToQueue}>
				{children}
			</ModalContext.Provider>
		</>
	);
}
