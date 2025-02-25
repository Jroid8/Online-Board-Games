import { useEffect, useRef, useState } from "react";
import randPastelColor from "../common/RandPastelColor.ts";
import { useNavigate } from "react-router";

export default function Logo() {
	const [titleText, setTitleText] = useState("");
	const titleSVG = useRef<SVGSVGElement | null>(null);
	const navigate = useNavigate();

	useEffect(() => {
		const svg = titleSVG.current!;
		const bbox = svg.getBBox();
		svg.setAttribute("height", bbox.height.toString());
		svg.setAttribute("width", bbox.width.toString());
	}, [titleText]);

	useEffect(() => {
		function shortLongName() {
			setTitleText(window.innerWidth < 760 ? "OBG" : "Online Board Games");
		}
		shortLongName();
		window.addEventListener("resize", shortLongName);
		return () => window.removeEventListener("resize", shortLongName);
	}, []);

	return (
		<svg ref={titleSVG} xmlns="http://www.w3.org/2000/svg">
			<text
				y="12"
				dominantBaseline="hanging"
				css={{
					fontSize: "3.4rem",
					fontWeight: "bold",
					cursor: "pointer",
				}}
				onClick={() => navigate("/")}
			>
				{titleText.split("").map((c, i) =>
					c == " " ? (
						c
					) : (
						<tspan
							key={i}
							fill={randPastelColor().toString()}
							stroke="#333"
							strokeWidth="2"
						>
							{c}
						</tspan>
					),
				)}
			</text>
		</svg>
	);
}
