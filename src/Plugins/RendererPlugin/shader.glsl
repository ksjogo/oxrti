precision mediump float;

uniform float iGlobalTime;

#pragma glslify: noise = require("glsl-noise/simplex/3d")

void main() {
  float n = noise(vec3(gl_FragCoord.xy * 0.005, iGlobalTime));
  gl_FragColor.rgb = vec3(n);
  gl_FragColor.a   = 1.0;
}