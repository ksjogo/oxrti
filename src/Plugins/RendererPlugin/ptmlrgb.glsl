precision highp float;
varying vec2 uv;
uniform sampler2D texR;
uniform sampler2D texG;
uniform sampler2D texB;
uniform sampler2D texL0;
uniform sampler2D texL1;
uniform sampler2D texL2;
uniform sampler2D texL3;
uniform sampler2D texL4;
uniform sampler2D texL5;

void main() {
//gl_FragColor = mix(texture2D(tex0, uv), vec4(0.0), step(0.5, abs(uv.x - 0.5) + abs(uv.y - 0.5)));
gl_FragColor = vec4(1,0,0,1);
gl_FragColor = vec4(
    texture2D(texR, uv).r,
    texture2D(texG, uv).r,
    texture2D(texB, uv).r,
    1);
}