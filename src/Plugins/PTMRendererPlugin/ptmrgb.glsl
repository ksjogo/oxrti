precision highp float;
varying vec2 uv;
uniform sampler2D texR[6];
uniform sampler2D texG[6];
uniform sampler2D texB[6];
uniform float biases[6];
uniform float scales[6];
uniform vec3 lightPosition;


float channelLum(sampler2D[6] coeffsTexs, vec3 tangentSpaceLight) {
   	float a0 = texture2D(coeffsTexs[0], uv).x;
    float a1 = texture2D(coeffsTexs[1], uv).x;
    float a2 = texture2D(coeffsTexs[2], uv).x;
    float a3 = texture2D(coeffsTexs[3], uv).x;
    float a4 = texture2D(coeffsTexs[4], uv).x;
    float a5 = texture2D(coeffsTexs[5], uv).x;
			
	a0 = (a0 * 255.0 - biases[0]) * scales[0];
	a1 = (a1 * 255.0 - biases[1]) * scales[1];
	a2 = (a2 * 255.0 - biases[2]) * scales[2];
	a3 = (a3 * 255.0 - biases[3]) * scales[3];
	a4 = (a4 * 255.0 - biases[4]) * scales[4];
	a5 = (a5 * 255.0 - biases[5]) * scales[5];
	
    float Lu = tangentSpaceLight.x;
    float Lv = tangentSpaceLight.y;

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
            vec3 pointPos = vec3(0,0,0);     
            vec3 toLight = normalize(lightPosition - pointPos);

            vec3 pointNormal = vec3(0,0,1);
            vec3 pointTangent = vec3(1,0,0);
            vec3 pointBinormal = vec3(0,1,0);


            vec3 tangentSpaceLight= vec3(
                dot(toLight, pointTangent),
                dot(toLight, pointBinormal),
                dot(toLight, pointNormal)
            );

            tangentSpaceLight.xy = normalize(tangentSpaceLight.xy);
            tangentSpaceLight.xy *= (1.0-tangentSpaceLight.z);

            float R = channelLum(texR, tangentSpaceLight);
            float G = channelLum(texG, tangentSpaceLight);
            float B = channelLum(texB, tangentSpaceLight);

            gl_FragColor = vec4(R,G,B,1.0);
}