/*!
 * pixi-filter-led - v1.0.0
 * Compiled Tue, 12 Sep 2017 17:02:15 UTC
 *
 * Licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license
 */

if (typeof PIXI === 'undefined' || typeof PIXI.filters === 'undefined') { throw 'PixiJS is required'; }

var vertex = "attribute vec2 aVertexPosition;\nattribute vec2 aTextureCoord;\n\nuniform mat3 projectionMatrix;\n\nvarying vec2 vTextureCoord;\n\nvoid main(void)\n{\n    gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);\n    vTextureCoord = aTextureCoord;\n}";

var fragment = "precision mediump float;\n\nvarying vec2 vTextureCoord;\n\nuniform sampler2D uSampler;\nuniform vec4 filterArea;\n\nuniform float size;\nuniform float fill;\nuniform vec4 background;\nuniform float intensity;\n\nvec2 mapCoord( vec2 coord )\n{\n    coord *= filterArea.xy;\n    coord += filterArea.zw;\n\n    return coord;\n}\n\nvec2 unmapCoord( vec2 coord )\n{\n    coord -= filterArea.zw;\n    coord /= filterArea.xy;\n\n    return coord;\n}\n\nvoid main(void)\n{\n    vec2 coord = mapCoord(vTextureCoord);\n\n    // Calculate radius of LED\n    float radius = size * fill * 0.5;\n\n    // Calculate relative position to middle of LED\n    vec2 relativeDistance = coord - floor( coord / size ) * size - vec2(size / 2.0, size / 2.0);\n    float distanceSquared = relativeDistance.x * relativeDistance.x + relativeDistance.y * relativeDistance.y;\n\n    // Calculate whether pixel is part of LED or background\n    if (distanceSquared > radius * radius) {\n        gl_FragColor = background;\n    } else {\n        // Use color of pixel that would be in the middle of LED\n        coord = floor( coord / size ) * size + vec2(size / 2.0, size / 2.0);\n        coord = unmapCoord(coord);\n        gl_FragColor = texture2D(uSampler, coord);\n    }\n\n    // If intensity parameter is used mix with orignal color\n    if (intensity < 1.0) {\n        vec4 original = texture2D(uSampler, vTextureCoord);\n        gl_FragColor = intensity * gl_FragColor + (1.0 - intensity) * original;\n    }\n}\n";

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
var LedFilter = (function (superclass) {
    function LedFilter(ref) {
        if ( ref === void 0 ) ref = {};
        var size = ref.size; if ( size === void 0 ) size = 10;
        var fill = ref.fill; if ( fill === void 0 ) fill = 0.9;
        var backgroundColor = ref.backgroundColor; if ( backgroundColor === void 0 ) backgroundColor = 0x000000;
        var backgroundAlpha = ref.backgroundAlpha; if ( backgroundAlpha === void 0 ) backgroundAlpha = 1;
        var intensity = ref.intensity; if ( intensity === void 0 ) intensity = 1;

        superclass.call(this, vertex, fragment);

        this.uniforms.background = new Float32Array([0, 0, 0, 1]);

        this.size = size;
        this.fill = fill;
        this.backgroundColor = backgroundColor;
        this.backgroundAlpha = backgroundAlpha;
        this.intensity = intensity;
    }

    if ( superclass ) LedFilter.__proto__ = superclass;
    LedFilter.prototype = Object.create( superclass && superclass.prototype );
    LedFilter.prototype.constructor = LedFilter;

    var prototypeAccessors = { size: {},fill: {},backgroundColor: {},backgroundAlpha: {},intensity: {} };

    /**
     * Size of each segment
     *
     * @member {number}
     * @default 10
     */
    prototypeAccessors.size.get = function () {
        return this.uniforms.size;
    };
    prototypeAccessors.size.set = function (value) {
        this.uniforms.size = value;
    };

    /**
     * How much of every square is filled with the LED. 1.0 means LEDs are touching
     *
     * @member {number}
     * @default 0.9
     */
    prototypeAccessors.fill.get = function () {
        return this.uniforms.fill;
    };
    prototypeAccessors.fill.set = function (value) {
        this.uniforms.fill = value;
    };

    /**
     * Background color
     *
     * @member {number}
     * @default 0x000000
     */
    prototypeAccessors.backgroundColor.get = function () {
        return PIXI.utils.rgb2hex(this.uniforms.background);
    };
    prototypeAccessors.backgroundColor.set = function (value) {
        PIXI.utils.hex2rgb(value, this.uniforms.background);
    };

    /**
     * Background alpha
     *
     * @member {number}
     * @default 1
     */
    prototypeAccessors.backgroundAlpha.get = function () {
        return this.uniforms.background[3];
    };
    prototypeAccessors.backgroundAlpha.set = function (value) {
        this.uniforms.background[3] = Math.min(1, Math.max(0, value));
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

    Object.defineProperties( LedFilter.prototype, prototypeAccessors );

    return LedFilter;
}(PIXI.Filter));

// Export to PixiJS namespace
PIXI.filters.LedFilter = LedFilter;

export { LedFilter };
//# sourceMappingURL=pixi-filter-led.es.js.map
