const shadow = "hsl(0 0% 14%)";

export default {
  borderRadius: "2ch",
  border: "2px solid " + shadow,
  boxShadow: "6px 9px " + shadow,
  "@media (max-width: 620px)": {
    padding: "3vmin",
  },
  "@media (min-width: 620px)": {
    padding: "3.7ch",
  },
};
