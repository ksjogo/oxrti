// as from https://gl-react-cookbook.surge.sh/colordisc
precision highp float;
varying vec2 uv;
uniform vec3 fromColor, toColor;
uniform  vec2 point;
void main() {
    float dist = distance(uv,point);
    if (dist < 0.05) {
        gl_FragColor = vec4(1,1,1,1);
    } else if (dist >= 0.05 && dist <= 0.06){
        gl_FragColor = vec4(0,0,0,1);
    }else {
        float d = 2.0 * distance(uv, vec2(0.5));
        gl_FragColor = mix(
            vec4(mix(fromColor, toColor, d), 1.0),
            vec4(0.0),
            step(1.0, d)
        );
    }
}