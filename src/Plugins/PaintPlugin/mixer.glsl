precision highp float;
varying vec2 uv;
uniform sampler2D children;
uniform bool layerVisibility[X];
uniform sampler2D layer[X];
uniform vec2 center;
uniform bool showBrush;
uniform float brushRadius;

void main() {
    vec4 base = texture2D(children, uv);
    // iterate over all layers
    for (int i=0; i < layerCount; i++) {
        if (layerVisibility[i]) {
            vec4 paint = texture2D(layer[i], uv);
            // and mix their color into the current color according to the layers transparency
            base = mix(base, paint, paint.a);
            // the result should always be opaque
            base.a = 1.0;
        }
    }

    // preview brush rendering to visualize the brush size (and rendering lag)
    if (showBrush) {
        vec2 d = uv - center;
        if (length(d) < brushRadius) {
            base = mix(base, vec4(0.5, 0.5, 0.5, 0.5), 0.5);
        }
    }

    gl_FragColor = base;
}