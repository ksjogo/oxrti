precision highp float;
varying vec2 uv;

uniform sampler2D children;

uniform vec2 A;
uniform vec2 B;
uniform vec2 C;
uniform vec2 D;

float isLeft( vec2 P0, vec2 P1, vec2 P2 )
{
    return ( (P1.x - P0.x) * (P2.y - P0.y) - (P2.x - P0.x) * (P1.y - P0.y) );
}
bool PointInRectangle(vec2 X, vec2 Y, vec2 Z, vec2 W, vec2 P)
{
    return (isLeft(X, Y, P) > 0.0 && isLeft(Y, Z, P) > 0.0 && isLeft(Z, W, P) > 0.0 && isLeft(W, X, P) > 0.0);
}

void main()
{  
     vec4 base = texture2D(children, uv);
     if (PointInRectangle(A,D,C,B,uv))
        gl_FragColor = mix(vec4(1.0,1.0,1.0,1.0),base,0.5);
    else
     gl_FragColor = base;
  }