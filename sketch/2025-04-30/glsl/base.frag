
precision highp float;

#define MAX_CELL 64.0
#define PI 4.

uniform vec2 u_resolution;
uniform int u_numCell;
uniform vec4 u_cells[int(MAX_CELL)];
uniform float u_noiseSize;
uniform float u_noiseSeed;
uniform float u_time;

vec2 hash22(vec2 p, float seed) {
    vec3 p3 = fract(vec3(p.xyx) * vec3(.1031, .1030, .0973));
    p3 += dot(p3, p3.yzx + 33.33 + seed);
    return fract((p3.xx + p3.yz) * p3.zy);
}

float smooth_noise(vec2 p, float seed) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    float a = hash22(i, seed).x;
    float b = hash22(i + vec2(1.0, 0.0), seed).x;
    float c = hash22(i + vec2(0.0, 1.0), seed).x;
    float d = hash22(i + vec2(1.0, 1.0), seed).x;
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
        mix(a, b, u.x),
        mix(c, d, u.x),
        u.y
    );
}

float noise2D(vec2 p, float seed) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;
    for (int i = 0; i < 4; i++) {
        value += smooth_noise(p * frequency, seed) * amplitude;
        amplitude *= 0.5;
        frequency *= 2.0;
    }
    return value;
}

vec2 wrapPosition(vec2 pos) {
    vec2 noisePos = pos * u_noiseSize;
    float n1 = noise2D(noisePos, u_noiseSeed);
    float n2 = noise2D(noisePos + vec2(5.2, 1.3), u_noiseSeed);
    float angle = n1 * 2.0 * PI;
    vec2 displacement = vec2(cos(angle), sin(angle)) * .5;
    displacement += vec2(n2, n1) * .05;
    float distanceFromCenter = distance(pos, vec2(.5));
    float falloff = smoothstep(1., .05, distanceFromCenter);
    return pos + displacement * falloff;
}

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
    st = wrapPosition(st);
    float depth = 0.;

    for (int i = 0; i <= int(MAX_CELL); i++) {
        if (i < u_numCell) {
            vec2 cellPos = vec2(u_cells[i].xy);
            vec2 cellSiz = vec2(u_cells[i].zw);
            int j = int(mod(float(i), 4.));
            if (abs(st.y - cellPos.y) <= cellSiz.y * .5) {
                if (abs(st.x - cellPos.x) <= cellSiz.x * .5) {
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
                    float d = sdBox(stToCell, cellSiz * 2.);
                    float rep = abs(sdfRep(d, .12) - .25);
                    depth += rep * .33;
                }
            }
        }
    }
    gl_FragColor = vec4(vec3(fract(depth)), 1.0);
}
