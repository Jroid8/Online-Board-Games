import { useEffect, useState } from "react";
import GameInfo from "../common/GameInfo";
import { css } from "@emotion/react";
import randPastelColor from "../common/RandPastelColor";

const selectCss = css({
  fontSize: "inherit",
  border: "2px black solid",
  borderRadius: "0.3em",
});

const sortMetToOrderName: { [key: string]: string[] } = {
  name: ["A-Z", "Z-A"],
  player: ["Descending", "Ascending"],
};

const sortMethods: { [key: string]: (a: GameInfo, b: GameInfo) => number } = {
  name: (a, b) => a.name.localeCompare(b.name),
  player: (a, b) => b.playersOnline - a.playersOnline,
};

export default function SearchSortBar({
  oninput,
}: {
  oninput: (
    filter: string,
    sortMet: (a: GameInfo, b: GameInfo) => number,
  ) => void;
}) {
  const [titleColor] = useState(() => randPastelColor().toString());
  const [sortColor] = useState(() => randPastelColor().toString());
  const [orderColor] = useState(() => randPastelColor().toString());
  const [filter, setFilter] = useState("");
  const [sortMet, setSortMet] = useState("name");
  const [order, setOrder] = useState("normal");
  const [orderNames, setOrderNames] = useState(sortMetToOrderName.name);

  useEffect(() => {
    setOrderNames(sortMetToOrderName[sortMet]);
  }, [sortMet]);
  useEffect(() => {
    const property = sortMethods[sortMet];
    oninput(
      filter,
      order[0] === "n"
        ? property
        : (a: GameInfo, b: GameInfo) => -property(a, b),
    );
  }, [sortMet, order, filter, oninput]);

  return (
    <div
      css={{
        display: "flex",
        alignItems: "center",
        fontSize: "1.15rem",
        gap: "3px",
      }}
    >
      <input
        css={{
          flex: 1,
          fontSize: "inherit",
          outline: "none",
          border: "2px black solid",
          borderRadius: "0.3em",
        }}
        style={{ backgroundColor: titleColor }}
        type="text"
        onChange={(e) => setFilter(e.target.value)}
      />
      <span css={{ margin: "0 0.3em 0 1em" }}>Order by:</span>
      <select
        css={selectCss}
        style={{ backgroundColor: sortColor }}
        name="sort"
        value={sortMet}
        onChange={(e) => setSortMet(e.target.value)}
      >
        <option value="name">Name</option>
        <option value="player">Player Count</option>
      </select>
      <select
        css={selectCss}
        style={{ backgroundColor: orderColor }}
        name="order"
        value={order}
        onChange={(e) => setOrder(e.target.value)}
      >
        <option value="normal">{orderNames[0]}</option>
        <option value="reverse">{orderNames[1]}</option>
      </select>
    </div>
  );
}
