import { css } from "@emotion/react";
import { useEffect, useState } from "react";
import randPastelColor from "../utils/RandPastelColor";
import HSL from "../utils/HSL";

type ComponentProps<T extends React.ElementType> =
	React.ComponentPropsWithoutRef<T> & { as?: T };

const style = css({
	border: "2px black solid",
	borderRadius: "0.7em",
	padding: "0.4em",
	boxShadow: "4px 6px black",
	font: "inherit",
	cursor: "pointer",
	"&:active": {
		boxShadow: "none",
		position: "relative",
		left: 2,
		top: 2,
	},
	"&:disabled": {
		boxShadow: "none",
		border: "2px #888 solid",
	},
});

export default function PastelFloatBtn<T extends React.ElementType>({
	as,
	children,
	css,
	...props
}: ComponentProps<T>) {
	const [color, setColor] = useState(() => randPastelColor());
	const Tag = as || "div";
	useEffect(() => {
		setColor((c) =>
			props.disabled ? new HSL(c.hue, 0, 72) : new HSL(c.hue, 98, 82),
		);
	}, [props.disabled]);
	return (
		<Tag
			css={[style, css]}
			style={{ ...props.style, backgroundColor: color.toString() }}
			{...props}
		>
			{children}
		</Tag>
	);
}
