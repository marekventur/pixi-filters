import {vertex} from '@tools/fragments';
import fragment from './displayWarp.frag';

/**
 * This filter applies a display warp effect. Based on https://www.shadertoy.com/view/XsjSzR
 *
 * Original Author: Timothy Lottes
 *
 * @class
 * @extends PIXI.Filter
 * @param {Object} [config] A configuration object containing settings for the filter.
 * @param {number} [config.warp= new PIXI.Point(32, 24)] Size of display warp
 * @param {number} [config.maskDark=0.5] Amount of shadow mask (dark)
 * @param {number} [config.maskLight=1.5] Amount of shadow mask (light)
 */
export default class DisplayWarpFilter extends PIXI.Filter {
    constructor({ warp = new PIXI.Point(1/32, 1/24), maskDark = 0.5, maskLight = 1.5 } = {}) {
        super(vertex, fragment);

        this.uniforms.mappedMatrix = new PIXI.Matrix();

        this.warp = warp;
        this.maskDark = maskDark;
        this.maskLight = maskLight;
    }

    /**
     * Size of simulated pixel
     *
     * @member {PIXI.Point|number}
     * @default PIXI.Point(32, 24)
     */
    get warp() {
        return this.uniforms.warp;
    }
    set warp(value) {
        this.uniforms.warp = value;
    }

    /**
     * Amount of shadow mask (dark)
     *
     * @member {number}
     * @default 0.5
     */
    get maskDark() {
        return this.uniforms.maskDark;
    }
    set maskDark(value) {
        this.uniforms.maskDark = value;
    }

    /**
     * Amount of shadow mask (light)
     *
     * @member {number}
     * @default 1.5
     */
    get maskLight() {
        return this.uniforms.maskLight;
    }
    set maskLight(value) {
        this.uniforms.maskLight = value;
    }

    apply (filterManager, input, output, clear){
        this.uniforms.mappedMatrix = filterManager.calculateNormalizedScreenSpaceMatrix(this.uniforms.mappedMatrix);
        filterManager.applyFilter(this, input, output, clear);
    }
}

// Export to PixiJS namespace
PIXI.filters.DisplayWarpFilter = DisplayWarpFilter;
