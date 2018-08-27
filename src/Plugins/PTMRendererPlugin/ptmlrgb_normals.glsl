precision highp float;
varying vec2 uv;
uniform sampler2D texL0;
uniform sampler2D texL1;
uniform sampler2D texL2;
uniform sampler2D texL3;
uniform sampler2D texL4;
uniform sampler2D texL5;
uniform float biases[6];
uniform float scales[6];
uniform int mode;

void main() {
    float a0 = texture2D(texL0, uv).x;
    float a1 = texture2D(texL1, uv).x;
    float a2 = texture2D(texL2, uv).x;
    float a3 = texture2D(texL3, uv).x;
    float a4 = texture2D(texL4, uv).x;
    float a5 = texture2D(texL5, uv).x;
    
    a0 = (a0 * 255.0 - biases[0]) * scales[0] / 255.0;
    a1 = (a1 * 255.0 - biases[1]) * scales[1] / 255.0;
    a2 = (a2 * 255.0 - biases[2]) * scales[2] / 255.0;
    a3 = (a3 * 255.0 - biases[3]) * scales[3] / 255.0;
    a4 = (a4 * 255.0 - biases[4]) * scales[4] / 255.0;
    a5 = (a5 * 255.0 - biases[5]) * scales[5] / 255.0;
    
    float Iu = clamp((a2 * a4 - 2.0 * a1 * a3) / (4.0 * a0 * a1 - a2 * a2),-1.0,1.0);
    float Iv =  clamp((a2 * a3 - 2.0 * a0 * a4) / (4.0 * a0 * a1 - a2 * a2),-1.0,1.0);
    float Iz = sqrt(1.0 - Iu * Iu - Iv * Iv);

    float Px = Iu * 0.5 + 0.5;
    float Py = Iv * 0.5 + 0.5;
    float Pz = Iz;

    if (mode == 1)
        gl_FragColor = vec4(Px, Px, Px, 1.0);
    else if (mode == 2)
        gl_FragColor = vec4(Py, Py, Py, 1.0);
    else if (mode == 3)
        gl_FragColor = vec4(Pz, Pz, Pz, 1.0);
    else if (mode == 4)
        gl_FragColor = vec4(Px, Py, Pz, 1.0);
}