import HSL from "./HSL.ts";

export default function randPastelColor(lightness?: number): HSL {
  return new HSL(Math.floor(Math.random() * 360), 98, lightness ?? 82);
}
