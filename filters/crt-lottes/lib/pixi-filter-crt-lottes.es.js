/*!
 * pixi-filter-crt-lottes - v1.0.0
 * Compiled Tue, 12 Sep 2017 17:32:14 UTC
 *
 * Licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license
 */

if (typeof PIXI === 'undefined' || typeof PIXI.filters === 'undefined') { throw 'PixiJS is required'; }

var vertex = "attribute vec2 aVertexPosition;\nattribute vec2 aTextureCoord;\n\nuniform mat3 projectionMatrix;\n\nvarying vec2 vTextureCoord;\n\nvoid main(void)\n{\n    gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);\n    vTextureCoord = aTextureCoord;\n}";

var fragment = "//\n// PUBLIC DOMAIN CRT STYLED SCAN-LINE SHADER\n//\n//   by Timothy Lottes\n//\n// This is more along the style of a really good CGA arcade monitor.\n// With RGB inputs instead of NTSC.\n// The shadow mask example has the mask rotated 90 degrees for less chromatic aberration.\n//\n// Left it unoptimized to show the theory behind the algorithm.\n//\n// It is an example what I personally would want as a display option for pixel art games.\n// Please take and use, change, or whatever.\n//\n// Adopted for PIXI.js by Marek Ventur\n\nprecision mediump float;\n\nvarying vec2 vTextureCoord;\n\nuniform sampler2D uSampler;\nuniform vec4 filterArea;\n\nvec2 mapCoord( vec2 coord )\n{\n    coord *= filterArea.xy;\n    coord += filterArea.zw;\n\n    return coord;\n}\n\nvec2 unmapCoord( vec2 coord )\n{\n    coord -= filterArea.zw;\n    coord /= filterArea.xy;\n\n    return coord;\n}\n\n// Emulated input resolution.\n#if 1\n  // Fix resolution to set amount.\n  #define res (vec2(320.0/1.0,160.0/1.0))\n#else\n  // Optimize for resize.\n  #define res (iResolution.xy/6.0)\n#endif\n\n// Hardness of scanline.\n//  -8.0 = soft\n// -16.0 = medium\nfloat hardScan=-8.0;\n\n// Hardness of pixels in scanline.\n// -2.0 = soft\n// -4.0 = hard\nfloat hardPix=-3.0;\n\n// Display warp.\n// 0.0 = none\n// 1.0/8.0 = extreme\nvec2 warp=vec2(1.0/32.0,1.0/24.0);\n\n// Amount of shadow mask.\nfloat maskDark=0.5;\nfloat maskLight=1.5;\n\n//------------------------------------------------------------------------\n\n// sRGB to Linear.\n// Assuing using sRGB typed textures this should not be needed.\nfloat ToLinear1(float c){return(c<=0.04045)?c/12.92:pow((c+0.055)/1.055,2.4);}\nvec3 ToLinear(vec3 c){return vec3(ToLinear1(c.r),ToLinear1(c.g),ToLinear1(c.b));}\n\n// Linear to sRGB.\n// Assuing using sRGB typed textures this should not be needed.\nfloat ToSrgb1(float c){return(c<0.0031308?c*12.92:1.055*pow(c,0.41666)-0.055);}\nvec3 ToSrgb(vec3 c){return vec3(ToSrgb1(c.r),ToSrgb1(c.g),ToSrgb1(c.b));}\n\n// Nearest emulated sample given floating point position and texel offset.\n// Also zero's off screen.\nvec3 Fetch(vec2 pos,vec2 off){\n  pos=floor(pos*res+off)/res;\n  //if(max(abs(pos.x-0.5),abs(pos.y-0.5))>0.5)return vec3(0.0,0.0,0.0);\n  return ToLinear(texture2D(uSampler,unmapCoord(pos.xy),-16.0).rgb);}\n\n// Distance in emulated pixels to nearest texel.\nvec2 Dist(vec2 pos){pos=pos*res;return -((pos-floor(pos))-vec2(0.5));}\n\n// 1D Gaussian.\nfloat Gaus(float pos,float scale){return exp2(scale*pos*pos);}\n\n// 3-tap Gaussian filter along horz line.\nvec3 Horz3(vec2 pos,float off){\n  vec3 b=Fetch(pos,vec2(-1.0,off));\n  vec3 c=Fetch(pos,vec2( 0.0,off));\n  vec3 d=Fetch(pos,vec2( 1.0,off));\n  float dst=Dist(pos).x;\n  // Convert distance to weight.\n  float scale=hardPix;\n  float wb=Gaus(dst-1.0,scale);\n  float wc=Gaus(dst+0.0,scale);\n  float wd=Gaus(dst+1.0,scale);\n  // Return filtered sample.\n  return (b*wb+c*wc+d*wd)/(wb+wc+wd);}\n\n// 5-tap Gaussian filter along horz line.\nvec3 Horz5(vec2 pos,float off){\n  vec3 a=Fetch(pos,vec2(-2.0,off));\n  vec3 b=Fetch(pos,vec2(-1.0,off));\n  vec3 c=Fetch(pos,vec2( 0.0,off));\n  vec3 d=Fetch(pos,vec2( 1.0,off));\n  vec3 e=Fetch(pos,vec2( 2.0,off));\n  float dst=Dist(pos).x;\n  // Convert distance to weight.\n  float scale=hardPix;\n  float wa=Gaus(dst-2.0,scale);\n  float wb=Gaus(dst-1.0,scale);\n  float wc=Gaus(dst+0.0,scale);\n  float wd=Gaus(dst+1.0,scale);\n  float we=Gaus(dst+2.0,scale);\n  // Return filtered sample.\n  return (a*wa+b*wb+c*wc+d*wd+e*we)/(wa+wb+wc+wd+we);}\n\n// Return scanline weight.\nfloat Scan(vec2 pos,float off){\n  float dst=Dist(pos).y;\n  return Gaus(dst+off,hardScan);}\n\n// Allow nearest three lines to effect pixel.\nvec3 Tri(vec2 pos){\n  vec3 a=Horz3(pos,-1.0);\n  vec3 b=Horz5(pos, 0.0);\n  vec3 c=Horz3(pos, 1.0);\n  float wa=Scan(pos,-1.0);\n  float wb=Scan(pos, 0.0);\n  float wc=Scan(pos, 1.0);\n  return a*wa+b*wb+c*wc;}\n\n// Distortion of scanlines, and end of screen alpha.\nvec2 Warp(vec2 pos){\n  pos=pos*2.0-1.0;\n  pos*=vec2(1.0+(pos.y*pos.y)*warp.x,1.0+(pos.x*pos.x)*warp.y);\n  return pos*0.5+0.5;}\n\n// Shadow mask.\nvec3 Mask(vec2 pos){\n  pos.x+=pos.y*3.0;\n  vec3 mask=vec3(maskDark,maskDark,maskDark);\n  pos.x=fract(pos.x/6.0);\n  if(pos.x<0.333)mask.r=maskLight;\n  else if(pos.x<0.666)mask.g=maskLight;\n  else mask.b=maskLight;\n  return mask;}\n\n// Entry.\nvoid main( void ){\n  vec2 fragCoord = mapCoord(vTextureCoord);\n  // Unmodified.\n\n  //vec2 pos=Warp(fragCoord.xy);\n  //gl_FragColor.rgb=Tri(pos)*Mask(fragCoord.xy);\n\n  gl_FragColor.rgb=Fetch(fragCoord, vec2(0.0, 0.0));\n\n  gl_FragColor.a=1.0;\n\n  gl_FragColor.rgb=ToSrgb(gl_FragColor.rgb);\n}\n\n";

/**
 * This filter applies a crt effect. Based on https://www.shadertoy.com/view/XsjSzR
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
var CrtLottesFilter = (function (superclass) {
    function CrtLottesFilter(ref) {
        if ( ref === void 0 ) ref = {};

        superclass.call(this, vertex, fragment);

    }

    if ( superclass ) CrtLottesFilter.__proto__ = superclass;
    CrtLottesFilter.prototype = Object.create( superclass && superclass.prototype );
    CrtLottesFilter.prototype.constructor = CrtLottesFilter;

    return CrtLottesFilter;
}(PIXI.Filter));

// Export to PixiJS namespace
PIXI.filters.CrtLottesFilter = CrtLottesFilter;

export { CrtLottesFilter };
//# sourceMappingURL=pixi-filter-crt-lottes.es.js.map