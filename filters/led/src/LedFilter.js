import {vertex} from '@tools/fragments';
import fragment from './led.frag';

/**
 * This filter applies a led effect, making the container look like it's some sort of public transport display
 *
 * @class
 * @extends PIXI.Filter
 * @param {Object} [config] A configuration object containing settings for the filter.
 * @param {number} [config.size=10] Width/height of the size of each segment
 * @param {number} [config.fill=0.9] How much of every square is filled with the LED. 1.0 means LEDs are touching
 * @param {number} [config.backgroundColor=0x000000] Background color
 * @param {number} [config.backgroundAlpha=1] Background alpha
 * @param {number} [config.intensity=1] Intensity of filter. O means disabled, 0.5 means even mix of original and filtered, 1 means filter only
 */
export default class LedFilter extends PIXI.Filter {

    constructor({ size = 10, fill = 0.9, backgroundColor = 0x000000, backgroundAlpha = 1, intensity = 1 } = {}) {
        super(vertex, fragment);

        this.uniforms.background = new Float32Array([0, 0, 0, 1]);

        this.size = size;
        this.fill = fill;
        this.backgroundColor = backgroundColor;
        this.backgroundAlpha = backgroundAlpha;
        this.intensity = intensity;
    }

    /**
     * Size of each segment
     *
     * @member {number}
     * @default 10
     */
    get size() {
        return this.uniforms.size;
    }
    set size(value) {
        this.uniforms.size = value;
    }

    /**
     * How much of every square is filled with the LED. 1.0 means LEDs are touching
     *
     * @member {number}
     * @default 0.9
     */
    get fill() {
        return this.uniforms.fill;
    }
    set fill(value) {
        this.uniforms.fill = value;
    }

    /**
     * Background color
     *
     * @member {number}
     * @default 0x000000
     */
    get backgroundColor() {
        return PIXI.utils.rgb2hex(this.uniforms.background);
    }
    set backgroundColor(value) {
        PIXI.utils.hex2rgb(value, this.uniforms.background);
    }

    /**
     * Background alpha
     *
     * @member {number}
     * @default 1
     */
    get backgroundAlpha() {
        return this.uniforms.background[3];
    }
    set backgroundAlpha(value) {
        this.uniforms.background[3] = Math.min(1, Math.max(0, value));
    }

    /**
     * Intensity of filter. O means disabled, 0.5 means even mix of original and filtered, 1 means filter only
     *
     * @member {number}
     * @default 1
     */
    get intensity() {
        return this.uniforms.intensity;
    }
    set intensity(value) {
        this.uniforms.intensity = value;
    }

}

// Export to PixiJS namespace
PIXI.filters.LedFilter = LedFilter;
