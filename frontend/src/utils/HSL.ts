export default class HSL {
	hue: number;
	saturation: number;
	lightness: number;

	constructor(hue: number, saturation: number, lightness: number) {
		this.hue = hue;
		this.saturation = saturation;
		this.lightness = lightness;
	}

	setHue(hue: number): HSL {
		return new HSL(hue, this.saturation, this.lightness);
	}

	setSaturation(saturation: number): HSL {
		return new HSL(this.hue, saturation, this.lightness);
	}

	setLightness(lightness: number): HSL {
		return new HSL(this.hue, this.saturation, lightness);
	}

	toString(): string {
		return `hsl(${this.hue}, ${this.saturation}%, ${this.lightness}%)`;
	}
}
