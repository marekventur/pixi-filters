import {vertex} from '@tools/fragments';
import fragment from './crtLottes.frag';

/**
 * This filter applies a crt effect. Based on https://www.shadertoy.com/view/XsjSzR
 *
 * Original Author: Timothy Lottes
 *
 * @class
 * @extends PIXI.Filter
 * @param {Object} [config] A configuration object containing settings for the filter.
 * @param {number} [config.size=3] Size of simulated pixel. 8 = soft; 16 = medium
 * @param {number} [config.hardScan=8] Hardness of scanline. 2 = soft; 4 = hard
 * @param {number} [config.hardPixel=3] Hardness of pixels in scanline
 * @param {number} [config.intensity=1] Intensity of filter. O means disabled, 0.5 means even mix of original and filtered, 1 means filter only
 */
export default class CrtLottesFilter extends PIXI.Filter {
    constructor({ size = 3, hardScan = 8, hardPixel = 3, intensity = 1 } = {}) {
        super(vertex, fragment);

        this.size = size;
        this.hardScan = hardScan;
        this.hardPixel = hardPixel;
        this.intensity = intensity;
    }

    /**
     * Size of simulated pixel
     *
     * @member {number}
     * @default 3
     */
    get size() {
        return this.uniforms.size;
    }
    set size(value) {
        this.uniforms.size = value;
    }

    /**
     * Hardness of scanline. 8 = soft; 16 = medium
     *
     * @member {number}
     * @default 8
     */
    get hardScan() {
        return this.uniforms.hardScan;
    }
    set hardScan(value) {
        this.uniforms.hardScan = value;
    }

    /**
     * Hardness of pixels in scanline. 2 = soft; 4 = hard
     *
     * @member {number}
     * @default 3
     */
    get hardPixel() {
        return this.uniforms.hardPixel;
    }
    set hardPixel(value) {
        this.uniforms.hardPixel = value;
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
PIXI.filters.CrtLottesFilter = CrtLottesFilter;
