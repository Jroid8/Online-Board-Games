import { Interpolation, Theme } from "@emotion/react";
import { createContext } from "react";

export default createContext<
	| null
	| (<T>(
			content: (close: (value: T) => void) => React.ReactNode,
			css?: Interpolation<Theme>,
	  ) => Promise<T>)
>(null);
