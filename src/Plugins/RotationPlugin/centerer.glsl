precision highp float;
varying vec2 uv;
uniform float angle;
uniform sampler2D children;
uniform float inputHeight;
uniform float inputWidth;
uniform float maxDim;

void main() {

  float uOffset = (maxDim-inputWidth)/2.0/maxDim;
  float vOffset = (maxDim-inputHeight)/2.0/maxDim;
  float uWidth = 1.0-2.0*uOffset;
  float vWidth = 1.0-2.0*vOffset;

  if (uv.x < uOffset || uv.x > (1.0 - uOffset) || uv.y < vOffset || uv.y > (1.0 - vOffset)) {
    gl_FragColor = vec4(0,0,0,0);
  } else {
    gl_FragColor =  texture2D(children, vec2(
      (uv.x - uOffset) / uWidth,
      (uv.y - vOffset) / vWidth
    ));
  }

  /*mat2 rotation = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
  vec2 p = (uv - vec2(0.5)) * rotation + vec2(0.5);
  gl_FragColor =
    p.x < 0.0 || p.x > 1.0 || p.y < 0.0 || p.y > 1.0
    ? vec4(0.0)
    : texture2D(children, p);*/
}