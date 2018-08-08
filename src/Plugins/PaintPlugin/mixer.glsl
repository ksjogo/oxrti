precision highp float;
varying vec2 uv;

uniform sampler2D children;

uniform bool layerVisibility[X];

uniform sampler2D layer[X];

void main()
{  
     vec4 base = texture2D(children, uv);

    for(int i=0; i < layerCount; i++) {
        if (layerVisibility[i]) {
            vec4 paint = texture2D(layer[i], uv);
            base = mix(base, paint, paint.a);
            base.a = 1.0;
        }
    }
     gl_FragColor = base;
  }