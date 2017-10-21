//
// PUBLIC DOMAIN CRT STYLED SCAN-LINE SHADER
//
//   by Timothy Lottes
//
// This is more along the style of a really good CGA arcade monitor.
// With RGB inputs instead of NTSC.
// The shadow mask example has the mask rotated 90 degrees for less chromatic aberration.
//
// Left it unoptimized to show the theory behind the algorithm.
//
// It is an example what I personally would want as a display option for pixel art games.
// Please take and use, change, or whatever.
//
// Adopted for PIXI.js by Marek Ventur

precision mediump float;

varying vec2 vTextureCoord;

uniform sampler2D uSampler;
uniform vec4 filterArea;
uniform mat3 mappedMatrix;
uniform vec2 warp;
uniform float maskDark;
uniform float maskLight;

vec4 sample(vec2 pos) {
    if (min(pos.x, pos.y) < 0.0) {
        return vec4(0.0, 0.0, 0.0, 0.0);
    }
    return texture2D(uSampler, pos.xy);
}

// Distortion of scanlines, and end of screen alpha.
vec2 Warp(vec2 pos){
    pos=pos*2.0-1.0;
    pos *= vec2(
        1.0 + (pos.y * pos.y) * warp.x,
        1.0 + (pos.x * pos.x) * warp.y
    );
    return pos*0.5+0.5;
}

// Shadow mask.
vec3 Mask(vec2 pos){
    pos.x+=pos.y*3.0;
    vec3 mask=vec3(maskDark,maskDark,maskDark);
    pos.x=fract(pos.x/6.0);
    if(pos.x<0.333) {
        mask.r=maskLight;
    } else if(pos.x<0.666) {
        mask.g=maskLight;
    } else {
        mask.b=maskLight;
    }
    return mask;
}

//vec2 to

void main( void ) {
    vec2 pos = (vec3( vTextureCoord.xy,1)*mappedMatrix).xy;
     pos = Warp(pos);
    if (abs(pos.x - 0.5) < 0.01 || abs(pos.y - 0.5) < 0.01) {
        gl_FragColor = vec4(0.0, 0.0, 1.0, 1.0);
    } else {
        gl_FragColor = sample(pos);  Mask(pos);
    }
}

