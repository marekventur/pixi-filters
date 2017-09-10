precision mediump float;

varying vec2 vTextureCoord;

uniform sampler2D uSampler;
uniform vec4 filterArea;

uniform float size;
uniform float fill;
uniform vec4 background;
uniform float intensity;

vec2 mapCoord( vec2 coord )
{
    coord *= filterArea.xy;
    coord += filterArea.zw;

    return coord;
}

vec2 unmapCoord( vec2 coord )
{
    coord -= filterArea.zw;
    coord /= filterArea.xy;

    return coord;
}

void main(void)
{
    vec2 coord = mapCoord(vTextureCoord);

    // Calculate radius of LED
    float radius = size * fill * 0.5;

    // Calculate relative position to middle of LED
    vec2 relativeDistance = coord - floor( coord / size ) * size - vec2(size / 2.0, size / 2.0);
    float distanceSquared = relativeDistance.x * relativeDistance.x + relativeDistance.y * relativeDistance.y;

    // Calculate whether pixel is part of LED or background
    if (distanceSquared > radius * radius) {
        gl_FragColor = background;
    } else {
        // Use color of pixel that would be in the middle of LED
        coord = floor( coord / size ) * size + vec2(size / 2.0, size / 2.0);
        coord = unmapCoord(coord);
        gl_FragColor = texture2D(uSampler, coord);
    }

    // If intensity parameter is used mix with orignal color
    if (intensity < 1.0) {
        vec4 original = texture2D(uSampler, vTextureCoord);
        gl_FragColor = intensity * gl_FragColor + (1.0 - intensity) * original;
    }
}
