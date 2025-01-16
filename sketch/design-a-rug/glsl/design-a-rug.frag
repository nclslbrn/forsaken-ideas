
precision highp float;

#define MAX_CELL 64.0
#define PI 3.14159265358979323846

uniform vec2 u_resolution;
uniform int u_numCell;
uniform vec4 u_cell[int(MAX_CELL)];
uniform float u_noiseSize;
uniform float u_noiseSeed;

const vec3 red = vec3(0.68, 0.12, 0.18);
const vec3 green = vec3(0.22, 0.48, 0.38);
const vec3 blue = vec3(0.07, 0.12, 0.28);
const vec3 cream = vec3(0.93, 0.89, 0.78);
const vec3 gold = vec3(0.85, 0.65, 0.22);

vec2 hash22(vec2 p, float seed) {
    vec3 p3 = fract(vec3(p.xyx) * vec3(.1031, .1030, .0973));
    p3 += dot(p3, p3.yzx + 33.33 + seed);
    return fract((p3.xx+p3.yz)*p3.zy);
}

// Convert hash value to smooth noise
float smooth_noise(vec2 p, float seed) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    
    // Get random values for corners of the cell
    float a = hash22(i, seed).x;
    float b = hash22(i + vec2(1.0, 0.0), seed).x;
    float c = hash22(i + vec2(0.0, 1.0), seed).x;
    float d = hash22(i + vec2(1.0, 1.0), seed).x;
    
    // Smooth interpolation
    vec2 u = f * f * (3.0 - 2.0 * f);
    
    // Mix values using bilinear interpolation
    return mix(
        mix(a, b, u.x),
        mix(c, d, u.x),
        u.y
    );
}

// Main noise function with multiple octaves
float noise2D(vec2 p, float seed) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;
    
    // Add multiple octaves of noise
    for(int i = 0; i < 4; i++) {
        value += smooth_noise(p * frequency, seed) * amplitude;
        amplitude *= 0.5;
        frequency *= 2.0;
    } 
    return value;
}

vec2 wrapPosition(vec2 pos) {
    vec2 noisePos = pos * u_noiseSize * 20.;
    float n1 = noise2D(noisePos, u_noiseSize);
    float n2 = noise2D(noisePos + vec2(5.2, 1.3), u_noiseSize);
    float angle = n1 * 2.0 * 3.14159;
    vec2 displacement = vec2(cos(angle), sin(angle)) * .5;
    displacement += vec2(n2, n1) * .5;
    float distanceFromCenter = distance(pos, vec2(.5));
    float falloff = smoothstep(1., 0., distanceFromCenter);
    return pos + displacement * falloff;
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

vec2 mirrorTile(vec2 _st) {
    if (_st.x > 0.5) _st.x = 1.0 - _st.x;
    if (_st.y > 0.5) _st.y = 1.0 - _st.y;
    return _st;
}

float frame(vec2 st, float s) {
    float d = min(min(st.x -s, (1. -s) - st.x), min(st.y - s, (1. - s) - st.y));
    return smoothstep(-s, s, d);
}

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    st = mirrorTile(fract(st));
    vec2 _st = st;
    _st.x *= u_resolution.x / u_resolution.y;
    // noise wrap 
    _st = wrapPosition(_st);
    // margin
    float n = noise2D(_st*350., u_noiseSeed);
    vec3 color = vec3(1.);

    for (int i = 0; i <= int(MAX_CELL); i++) {
        if (i < u_numCell) {
            vec2 cellPos = vec2(u_cell[i].xy); 
            vec2 cellSiz = vec2(u_cell[i].zw);
            vec2 stToCell = _st - cellPos;

            float d = sdBox(abs(stToCell), cellSiz);
          
            if (abs(st.y - cellPos.y) <= cellSiz.y) {
                if (abs(st.x - cellPos.x) <= cellSiz.x) {
                    if (d < 0.) {
                        vec2 st_ = fract((_st-cellPos)/cellSiz);
                        st_ = rotate2D(st_, PI*(float(i)));
                        float tri = step(st_.x, st_.y);
                        // color = tri > 0.5 ? red : cream; 
                        
                        float rep = abs(sdfRep(d, n*.05) - n*.1) > .1 ? 0. : 1.;
                        color = tri > 0.5 
                          ? rep+tri > 1. ? red : gold 
                          : rep < 0.5 ? blue : cream;
                        
                    }
                }
            }
        }
    }
    color = mix(color, green, abs(n-0.5));
    color = mix(cream, color, frame(st, .02));
    color = mix(gold, color, step(0.2, 1.-sdBox(vec2(0)-st, vec2(.6))));
    color = mix(color, vec3(0.), abs(n));
    gl_FragColor = vec4(color, 1.0);
}
