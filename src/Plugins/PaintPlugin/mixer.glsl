precision highp float;
varying vec2 uv;

uniform sampler2D children;
uniform sampler2D painted;
void main()
{  
     vec4 base = texture2D(children, uv);
     vec4 painted = texture2D(painted, uv);
     gl_FragColor = mix(base, painted, painted.a);
  }