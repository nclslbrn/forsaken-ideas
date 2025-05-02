
precision highp float;

#define MAX_CELL 64.0
#define PI 4.

uniform vec2 u_resolution;
uniform int u_numCell;
uniform vec4 u_cells[int(MAX_CELL)];
uniform float u_noiseSize;
uniform float u_noiseSeed;
uniform float u_time;

float sdBox(in vec2 p, in vec2 wh) {
    vec2 d = abs(p) - wh;
    return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0);
}

float sdCircle(vec2 p, float r) {
    return length(p) - r;
}

float sdfRep(in float x, in float r) {
    x /= r;
    x -= floor(x) + .5;
    x *= r;
    return x;
}

vec2 rotate2D(vec2 _st, float _angle) {
    _st -= 0.5;
    _st = mat2(cos(_angle), -sin(_angle),
            sin(_angle), cos(_angle)) * _st;
    _st += 0.5;
    return _st;
}

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    float depth = 0.;

    for (int i = 0; i <= int(MAX_CELL); i++) {
        if (i < u_numCell) {
            vec2 cellPos = vec2(u_cells[i].xy);
            vec2 cellSiz = vec2(u_cells[i].zw);
            int j = int(mod(float(i), 4.));
            if (abs(st.y - cellPos.y) <= cellSiz.y) {
                if (abs(st.x - cellPos.x) <= cellSiz.x) {
                    st = rotate2D(st, PI*(float(i)*.5));
                    vec2 stToCell = st - cellPos;
                    
                    if (j == 0) {
                      stToCell -= cellSiz;
                    } 
                    if (j == 1) {
                        stToCell.x += cellSiz.x * 2.;
                    }
                    if (j == 2) {
                        stToCell += cellSiz * 2.;
                    }
                    if (j == 3) {
                        stToCell.y += cellSiz.y * 2.;
                    }
                    float d = sdCircle(
                            stToCell,
                            (mod(float(i), 2.) > 0. ? cellSiz.x : cellSiz.y) * .5
                    );
                    float rep = abs(sdfRep(d, .33) - .66);
                    depth += mod(rep, 0.49);

                }
            }
        }
    }
    gl_FragColor = vec4(vec3(depth), 1.0);
}
