precision lowp float;

uniform vec2 u_resolution;
uniform vec2 u_circlePos;
uniform float u_time;

#define PI 3.1415926535897

// By Inigo Quilez
// https://iquilezles.org/articles/distfunctions2d/
float sdCircle( vec2 p, float r ) {
    return length(p) - r;
}

// Unidentified source, probably Piter Pasma
float sdfRep(in float x, in float r) {
    x /= r;
    x -= floor(x) + .5;
    x *= r;
    return x;
}

// Patricio Gonzalez Vivo & Jen Lowe
// thebookofshaders.com 
vec2 rotate2D (vec2 _st, float _angle) {
    _st -= 0.5;
    _st =  mat2(cos(_angle),-sin(_angle),
                sin(_angle),cos(_angle)) * _st;
    _st += 0.5;
    return _st;
}

vec2 tile (vec2 _st, float _zoom) {
    _st *= _zoom;
    return fract(_st);
}
vec2 rotateTilePattern(vec2 _st){

    //  Scale the coordinate system by 2x2
    _st *= 2.0;

    //  Give each cell an index number
    //  according to its position
    float index = 0.0;
    index += step(1., mod(_st.x,2.0));
    index += step(1., mod(_st.y,2.0))*2.0;

    //      |
    //  2   |   3
    //      |
    //--------------
    //      |
    //  0   |   1
    //      |

    // Make each cell between 0.0 - 1.0
    _st = fract(_st);

    // Rotate each cell according to the index
    if(index == 1.0){
        //  Rotate cell 1 by 90 degrees
        _st = rotate2D(_st,PI*0.5);
    } else if(index == 2.0){
        //  Rotate cell 2 by -90 degrees
        _st = rotate2D(_st,PI*-0.5);
    } else if(index == 3.0){
        //  Rotate cell 3 by 180 degrees
        _st = rotate2D(_st,PI);
    }

    return _st;
}

void main() { 
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    float d = sdCircle(st.xy - u_circlePos, 1.);
    
    vec2 sq = tile(st, 2.);
    sq = rotateTilePattern(sq);
    sq = tile(
        sq*3., 
        d > 0.1 ? pow(d, 2.)*2. : pow(1.-d, 2.) 
    );
    
    vec2 bl = step(vec2(0.1),st);
    vec2 tr = step(vec2(0.1),1.0-st);
    
    float t = step(sq.x,sq.y);

    vec3 color = vec3(max(t, 1.-(bl.x*bl.y*tr.x*tr.y)));
    
    gl_FragColor = vec4(color, 1.0);
}
