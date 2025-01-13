
precision highp float;

#define MAX_CELL 64.0
#define PI 3.14159265358979323846

uniform vec2 u_resolution;
uniform int u_numCell;
uniform vec4 u_cell[int(MAX_CELL)];

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
vec2 rotate2D (vec2 _st, float _angle) {
    _st -= 0.5;
    _st =  mat2(cos(_angle),-sin(_angle),
                sin(_angle),cos(_angle)) * _st;
    _st += 0.5;
    return _st;
}

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    st *= 1.05;

    vec3 color = vec3(.85);

    for (int i = 0; i <= int(MAX_CELL); i++) {
        if (i < u_numCell) {
            vec2 cellPos = vec2(0.025) + vec2(u_cell[i].xy);
            vec2 cellSiz = vec2(u_cell[i].zw);
            vec2 stToCell = st - cellPos;

            float d = sdBox(abs(stToCell), cellSiz);
          
            if (abs(st.y - cellPos.y) <= cellSiz.y * .5) {
                if (abs(st.x - cellPos.x) <= cellSiz.x * .5) {
                    if (d < 0.) {
                        vec2 _st = fract(((st-cellPos)/cellSiz)*2.);
                        _st = rotate2D(_st, PI*(float(i)*.5));
                        float tri = step(_st.x, _st.y);
                        color = vec3(mix(0.15, 0.85, tri));
                    }
                }
            }
        }
    }

    gl_FragColor = vec4(color, 1.0);
}
