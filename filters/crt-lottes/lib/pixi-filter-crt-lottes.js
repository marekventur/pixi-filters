/*!
 * pixi-filter-crt-lottes - v1.0.0
 * Compiled Tue, 12 Sep 2017 20:44:46 UTC
 *
 * Licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license
 */

(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.__pixi_filter_crt_lottes = {})));
}(this, (function (exports) { 'use strict';

if (typeof PIXI === 'undefined' || typeof PIXI.filters === 'undefined') { throw 'PixiJS is required'; }

var vertex = "attribute vec2 aVertexPosition;\nattribute vec2 aTextureCoord;\n\nuniform mat3 projectionMatrix;\n\nvarying vec2 vTextureCoord;\n\nvoid main(void)\n{\n    gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);\n    vTextureCoord = aTextureCoord;\n}";

var fragment = "//\n// PUBLIC DOMAIN CRT STYLED SCAN-LINE SHADER\n//\n//   by Timothy Lottes\n//\n// This is more along the style of a really good CGA arcade monitor.\n// With RGB inputs instead of NTSC.\n// The shadow mask example has the mask rotated 90 degrees for less chromatic aberration.\n//\n// Left it unoptimized to show the theory behind the algorithm.\n//\n// It is an example what I personally would want as a display option for pixel art games.\n// Please take and use, change, or whatever.\n//\n// Adopted for PIXI.js by Marek Ventur\n\nprecision mediump float;\n\nvarying vec2 vTextureCoord;\n\nuniform sampler2D uSampler;\nuniform vec4 filterArea;\nuniform float size;\nuniform float hardScan;\nuniform float hardPixel;\nuniform float intensity;\n\nvec2 warp =vec2(0.0, 0.0); //vec2(1.0/32.0,1.0/24.0);\n\n// Emulated input resolution.\n#define res (filterArea.xy/size/2.0)\n\n//------------------------------------------------------------------------\n\n// sRGB to Linear.\n// Assuing using sRGB typed textures this should not be needed.\nfloat ToLinear1(float c){return(c<=0.04045)?c/12.92:pow((c+0.055)/1.055,2.4);}\nvec3 ToLinear(vec3 c){return vec3(ToLinear1(c.r),ToLinear1(c.g),ToLinear1(c.b));}\n\n// Linear to sRGB.\n// Assuing using sRGB typed textures this should not be needed.\nfloat ToSrgb1(float c){return(c<0.0031308?c*12.92:1.055*pow(c,0.41666)-0.055);}\nvec3 ToSrgb(vec3 c){return vec3(ToSrgb1(c.r),ToSrgb1(c.g),ToSrgb1(c.b));}\n\n// Nearest emulated sample given floating point position and texel offset.\n// Also zero's off screen.\nvec3 Fetch(vec2 pos,vec2 off){\n  pos=floor(pos*res+off)/res;\n  return ToLinear(texture2D(uSampler,(pos.xy),-16.0).rgb);\n}\n\n// Distance in emulated pixels to nearest texel.\nvec2 Dist(vec2 pos){pos=pos*res;return -((pos-floor(pos))-vec2(0.5));}\n\n// 1D Gaussian.\nfloat Gaus(float pos,float scale){return exp2(scale*pos*pos);}\n\n// 3-tap Gaussian filter along horz line.\nvec3 Horz3(vec2 pos,float off){\n    vec3 b=Fetch(pos,vec2(-1.0,off));\n    vec3 c=Fetch(pos,vec2( 0.0,off));\n    vec3 d=Fetch(pos,vec2( 1.0,off));\n    float dst=Dist(pos).x;\n    // Convert distance to weight.\n    float scale=-hardPixel;\n    float wb=Gaus(dst-1.0,scale);\n    float wc=Gaus(dst+0.0,scale);\n    float wd=Gaus(dst+1.0,scale);\n    // Return filtered sample.\n    return (b*wb+c*wc+d*wd)/(wb+wc+wd);\n}\n\n// 5-tap Gaussian filter along horz line.\nvec3 Horz5(vec2 pos,float off){\n    vec3 a=Fetch(pos,vec2(-2.0,off));\n    vec3 b=Fetch(pos,vec2(-1.0,off));\n    vec3 c=Fetch(pos,vec2( 0.0,off));\n    vec3 d=Fetch(pos,vec2( 1.0,off));\n    vec3 e=Fetch(pos,vec2( 2.0,off));\n    float dst=Dist(pos).x;\n    // Convert distance to weight.\n    float scale=-hardPixel;\n    float wa=Gaus(dst-2.0,scale);\n    float wb=Gaus(dst-1.0,scale);\n    float wc=Gaus(dst+0.0,scale);\n    float wd=Gaus(dst+1.0,scale);\n    float we=Gaus(dst+2.0,scale);\n    // Return filtered sample.\n    return (a*wa+b*wb+c*wc+d*wd+e*we)/(wa+wb+wc+wd+we);\n}\n\n// Return scanline weight.\nfloat Scan(vec2 pos,float off){\n    float dst=Dist(pos).y;\n    return Gaus(dst+off,-hardScan);\n}\n\n// Allow nearest three lines to effect pixel.\nvec3 Tri(vec2 pos){\n    vec3 a=Horz3(pos,-1.0);\n    vec3 b=Horz5(pos, 0.0);\n    vec3 c=Horz3(pos, 1.0);\n    float wa=Scan(pos,-1.0);\n    float wb=Scan(pos, 0.0);\n    float wc=Scan(pos, 1.0);\n    return a*wa+b*wb+c*wc;\n}\n\nvoid main( void ){\n    gl_FragColor.rgb=Tri(vTextureCoord);\n    gl_FragColor.rgb=ToSrgb(gl_FragColor.rgb);\n    // If intensity parameter is used mix with orignal color\n    if (intensity < 1.0) {\n        vec4 original = texture2D(uSampler, vTextureCoord);\n        gl_FragColor = intensity * gl_FragColor + (1.0 - intensity) * original;\n    }\n}\n\n";

/**
 * This filter applies a crt effect. Based on https://www.shadertoy.com/view/XsjSzR
 *
 * @class
 * @extends PIXI.Filter
 * @param {Object} [config] A configuration object containing settings for the filter.
 * @param {number} [config.size=3] Size of simulated pixel. 8 = soft; 16 = medium
 * @param {number} [config.hardScan=8] Hardness of scanline. 2 = soft; 4 = hard
 * @param {number} [config.hardPixel=3] Hardness of pixels in scanline
 * @param {number} [config.intensity=1] Intensity of filter. O means disabled, 0.5 means even mix of original and filtered, 1 means filter only
 */
var CrtLottesFilter = (function (superclass) {
    function CrtLottesFilter(ref) {
        if ( ref === void 0 ) ref = {};
        var size = ref.size; if ( size === void 0 ) size = 3;
        var hardScan = ref.hardScan; if ( hardScan === void 0 ) hardScan = 8;
        var hardPixel = ref.hardPixel; if ( hardPixel === void 0 ) hardPixel = 3;
        var intensity = ref.intensity; if ( intensity === void 0 ) intensity = 1;

        superclass.call(this, vertex, fragment);

        this.size = size;
        this.hardScan = hardScan;
        this.hardPixel = hardPixel;
        this.intensity = intensity;
    }

    if ( superclass ) CrtLottesFilter.__proto__ = superclass;
    CrtLottesFilter.prototype = Object.create( superclass && superclass.prototype );
    CrtLottesFilter.prototype.constructor = CrtLottesFilter;

    var prototypeAccessors = { size: {},hardScan: {},hardPixel: {},intensity: {} };

    /**
     * Size of simulated pixel
     *
     * @member {number}
     * @default 3
     */
    prototypeAccessors.size.get = function () {
        return this.uniforms.size;
    };
    prototypeAccessors.size.set = function (value) {
        this.uniforms.size = value;
    };

    /**
     * Hardness of scanline. 8 = soft; 16 = medium
     *
     * @member {number}
     * @default 8
     */
    prototypeAccessors.hardScan.get = function () {
        return this.uniforms.hardScan;
    };
    prototypeAccessors.hardScan.set = function (value) {
        this.uniforms.hardScan = value;
    };

    /**
     * Hardness of pixels in scanline. 2 = soft; 4 = hard
     *
     * @member {number}
     * @default 3
     */
    prototypeAccessors.hardPixel.get = function () {
        return this.uniforms.hardPixel;
    };
    prototypeAccessors.hardPixel.set = function (value) {
        this.uniforms.hardPixel = value;
    };

    /**
     * Intensity of filter. O means disabled, 0.5 means even mix of original and filtered, 1 means filter only
     *
     * @member {number}
     * @default 1
     */
    prototypeAccessors.intensity.get = function () {
        return this.uniforms.intensity;
    };
    prototypeAccessors.intensity.set = function (value) {
        this.uniforms.intensity = value;
    };

    Object.defineProperties( CrtLottesFilter.prototype, prototypeAccessors );

    return CrtLottesFilter;
}(PIXI.Filter));

// Export to PixiJS namespace
PIXI.filters.CrtLottesFilter = CrtLottesFilter;

exports.CrtLottesFilter = CrtLottesFilter;

Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=pixi-filter-crt-lottes.js.map
