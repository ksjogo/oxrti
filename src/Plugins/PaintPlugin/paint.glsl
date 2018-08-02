precision highp float;
varying vec2 uv;
uniform bool drawing;
uniform vec4 color;
uniform vec2 center;
uniform float brushRadius;
void main() {
  if (drawing) {
    vec2 d = uv - center;
    if (length(d) < brushRadius) {
      gl_FragColor = color;
    }
    else {
      discard;
    }
  }
  else {
    discard;
  }
} 