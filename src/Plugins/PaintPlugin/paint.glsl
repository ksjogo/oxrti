precision highp float;
varying vec2 uv;
uniform bool drawing;
uniform vec4 color;
uniform vec2 center;
uniform float brushRadius;
// the texture is permanent/not-cleared, if the shader discards, the old value is kept
void main() {
    if (drawing) {
        // only do changes if we are drawing currently
        vec2 d = uv - center;
        // paint if our point is near enough to the brush center
        if (length(d) < brushRadius) {
            gl_FragColor = color;
        } else {
            discard;
        }
    } else {
        discard;
    }
} 