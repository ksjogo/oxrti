precision highp float;
varying vec2 uv;
// higher and lower coefficents per color
uniform sampler2D texR[2];
uniform sampler2D texG[2];
uniform sampler2D texB[2];
uniform float biases[6];
uniform float scales[6];
uniform vec3 lightPosition;

float channelLum(sampler2D[2] coeffsTexs, vec3 toLight) {
    // would be unrolled by the GLSL compiler anyway
    float a0 = texture2D(coeffsTexs[0], uv).x;
    float a1 = texture2D(coeffsTexs[0], uv).y;
    float a2 = texture2D(coeffsTexs[0], uv).z;
    float a3 = texture2D(coeffsTexs[1], uv).x;
    float a4 = texture2D(coeffsTexs[1], uv).y;
    float a5 = texture2D(coeffsTexs[1], uv).z;
			
    a0 = (a0 * 255.0 - biases[0]) * scales[0];
    a1 = (a1 * 255.0 - biases[1]) * scales[1];
    a2 = (a2 * 255.0 - biases[2]) * scales[2];
    a3 = (a3 * 255.0 - biases[3]) * scales[3];
    a4 = (a4 * 255.0 - biases[4]) * scales[4];
    a5 = (a5 * 255.0 - biases[5]) * scales[5];
	
    float Lu = toLight.x;
    float Lv = toLight.y;

    float lum = (
        a0 * Lu * Lu +
        a1 * Lv * Lv +
        a2 * Lu * Lv +
        a3 * Lu +
        a4 * Lv +
        a5
    )/255.0;
    return lum;
}

void main() {
    // spotlight behaviour at the moment
    vec3 pointPos = vec3(0,0,0);     
    vec3 toLight = normalize(lightPosition - pointPos);

    float R = channelLum(texR, toLight);
    float G = channelLum(texG, toLight);
    float B = channelLum(texB, toLight);

    gl_FragColor = vec4(R,G,B,1.0);
}