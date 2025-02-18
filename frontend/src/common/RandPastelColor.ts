export default function randPastelColor(lightness?: number): string {
	return "hsl(" + Math.floor(Math.random() * 360) + ", 98%, " + (lightness ?? 82) + "%)"
}
