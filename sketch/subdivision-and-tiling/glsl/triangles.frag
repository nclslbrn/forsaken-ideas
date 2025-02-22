
precision highp float;

#define MAX_CELL 64.0
#define PI 3.14159265358979323846

uniform vec2 u_resolution;
uniform int u_numCell;
uniform vec4 u_cells[int(MAX_CELL)];
uniform float u_noiseSeed;
uniform float u_noiseSize;
uniform vec2 u_target;

float sdBox(in vec2 p, in vec2 wh) {
    vec2 d = abs(p) - wh;
    return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0);
}
float sdfRep(in float x, in float r) {
    x /= r;
    x -= floor(x) + .5;
    x *= r;
    return x;
}
// https://iquilezles.org/articles/distfunctions2d/
float sdCircle( vec2 p, float r ) {
    return length(p) - r;
}
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
    _st *= 2.0;
    float index = 0.0;
    index += step(1., mod(_st.x,2.0));
    index += step(1., mod(_st.y,2.0))*2.0;
    _st = fract(_st);
    if(index == 1.0){
        _st = rotate2D(_st,PI*0.5);
    } else if(index == 2.0){
        _st = rotate2D(_st,PI*-0.5);
    } else if(index == 3.0){
        _st = rotate2D(_st,PI);
    }
    return _st;
}
void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    float d = sdCircle(st.xy - u_target, 1.6);
    vec2 sq = tile(st, 1.5);
    sq = rotateTilePattern(sq);
    sq = tile(sq, d);
    float color = 1.;

    for (int i = 0; i <= int(MAX_CELL); i++) {
        if (i < u_numCell) {
            vec2 cellPos = vec2(u_cells[i].xy);
            vec2 cellSiz = vec2(u_cells[i].zw);
            vec2 stToCell = sq - cellPos;

            float d = sdBox(abs(stToCell), cellSiz);
          
            if (abs(sq.y - cellPos.y) <= cellSiz.y * .5) {
                if (abs(sq.x - cellPos.x) <= cellSiz.x * .5) {
                    if (d < 0.) {
                        vec2 _st = fract(((sq-cellPos)/cellSiz));
                        _st = rotate2D(_st, PI*(float(i)*.5));
                        float tri = step(_st.x, _st.y);
                        color = mix(0.15, 1., tri);
                    }
                }
            }
        }
    }
    vec2 bl = step(vec2(0.1),st);
    vec2 tr = step(vec2(0.1),1.0-st);
    float crop = 1.-(bl.x*bl.y*tr.x*tr.y);
    gl_FragColor = vec4(vec3(max(crop, color)), 1.0);
}
