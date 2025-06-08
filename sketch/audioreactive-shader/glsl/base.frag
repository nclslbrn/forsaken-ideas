precision highp float;
#define PI 3.14159265358979323846
#define MAX_CELL 64.0

uniform vec2 u_resolution;
uniform float u_time;
uniform sampler2D u_freqText;
uniform int u_numCell;
uniform vec4 u_cells[int(MAX_CELL)];


vec3 hsv2rgb(vec3 c) {
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}
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
    float bandHeight = 0.165;
    float spectrometer = step((st.y / bandHeight), pow(freqBand, 2.));
    // Convert HSV to RGB
    vec3 color = vec3(1.); 
    /*hsv2rgb(
        vec3(
            fract(.66 + st.x * .33), 
            fract(step(freqBand, .9) * sin(2. - st.y)), 
            texture2D(u_freqText, vec2(st.x, st.y)).r
    ));
    */

    st *= 1.05;
 

    for (int i = 0; i <= int(MAX_CELL); i++) {
        if (i < u_numCell) {
            vec2 cellPos = vec2(.025) + vec2(u_cells[i].xy);
            vec2 cellSiz = vec2(u_cells[i].zw);
            vec2 stToCell = st - cellPos;

            float d = sdBox(abs(stToCell), cellSiz * (0.5 + freqBand *.5));
          
            if (abs(st.y-bandHeight*.5 - cellPos.y) <= cellSiz.y * .5) {
                if (abs(st.x - cellPos.x) <= cellSiz.x * .5) {
                    if (d < 0.) {
                        float index = 0.0;
                        index += step(1., mod(st.x-cellPos.x, 8.0));
                        index += step(1., mod(st.y-cellPos.y, 8.0))*4.0;
                        vec2 _st = fract(sin(exp(st-cellPos)/(cellSiz))*8.);
                        _st = rotate2D(_st, PI*(float(index)*.5 + freqBand * st.y));
                        float tri = step(_st.x, _st.y);
                        color *= vec3(mix(0., 1., tri));
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
