precision highp float;
#define PI 3.14159265358979323846
#define MAX_CELL 64.0

uniform vec2 u_resolution;
uniform float u_time;
uniform sampler2D u_freqText;
uniform int u_numCell;
uniform vec4 u_cells[int(MAX_CELL)];

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
    float scx = (st.x * 1.4) - .2;
    float freqBand = texture2D(u_freqText, vec2(floor(scx * 32.) / 43., .0)).r;
    float powFreq = fract(pow(freqBand, 5.));
    float bandHeight = 0.165;
    float spectrometer = step((st.y / bandHeight), pow(freqBand, 2.));
    vec3 color = vec3(.95); 
    st *= vec2(1.05, 1.2);
 

    for (int i = 0; i <= int(MAX_CELL); i++) {
        if (i < u_numCell) {
            vec2 cellPos = vec2(.025, 0.15) + vec2(u_cells[i].xy);
            vec2 cellSiz = vec2(u_cells[i].zw);
            vec2 stToCell = st - cellPos;
            float j = 1. + mod(float(i), 3.);
            float d = sdBox(abs(stToCell), cellSiz * 0.5);
          
            if (abs(st.y - cellPos.y) <= cellSiz.y * 0.5) {
                if (abs(st.x - cellPos.x) <= cellSiz.x * 0.5) {
                    if (d < -0.001) {
                        float index = .0;
                        index += step(1., mod(st.x-cellPos.x, 8.));
                        index += step(1., mod(st.y-cellPos.y, 8.)) * 8.;

                        vec2 _st = rotate2D(st, PI*(index*.5)); 
                        _st = fract(exp(abs(cellPos-st) * powFreq * 4.));
                        vec2 subCell = cellSiz/8.;

                        vec2 bl = step(subCell/8., mod(_st, powFreq));
                        vec2 tr = step(subCell/8., 1.-mod(_st, powFreq));

                        float incell = 1. - (bl.x * bl.y * tr.x * tr.y);
                        
                        float tri = step(_st.x, _st.y);

                        float fill = incell * tri;
                        color *= vec3(mix(.1, 1., fill));
                    }
                }
            }
        }
    }


    if (spectrometer == 1. && st.x > .22 && st.x < .78) { 
        color = vec3(.0);
    } 
        
    gl_FragColor = vec4(color, 1.0);
}
