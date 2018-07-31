precision highp float;
varying vec2 uv;
uniform float scale;
uniform sampler2D children;
uniform float panX;
uniform float panY;

void main() {
  vec2 p = (uv + vec2(panX, panY) - vec2(0.5)) * scale + vec2(0.5);
  gl_FragColor =
    p.x < 0.0 || p.x > 1.0 || p.y < 0.0 || p.y > 1.0
    ? vec4(0.0)
    : texture2D(children, p);
}