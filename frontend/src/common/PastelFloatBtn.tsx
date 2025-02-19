import { css } from "@emotion/react";
import { useState } from "react";
import randPastelColor from "./RandPastelColor";

type ComponentProps<T extends React.ElementType> =
  React.ComponentPropsWithoutRef<T> & { as?: T };

const style = css({
  border: "2px black solid",
  borderRadius: "0.7em",
  padding: "0.4em",
  boxShadow: "4px 6px black",
  "&:active": {
    boxShadow: "none",
  },
});

export default function PastelFloatBtn<T extends React.ElementType>({
  as,
  children,
  ...props
}: ComponentProps<T>) {
  const [color] = useState(() => randPastelColor());
  const Tag = as || "div";
  return (
    <Tag css={style} style={{ backgroundColor: color }} {...props}>
      {children}
    </Tag>
  );
}
