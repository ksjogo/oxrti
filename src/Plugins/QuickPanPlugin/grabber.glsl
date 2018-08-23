precision highp float;
varying vec2 uv;
uniform sampler2D children;
void main() { 
    //gl_FragColor = vec4(1.0,0,0,1.0);
    gl_FragColor = texture2D(children, uv);
}