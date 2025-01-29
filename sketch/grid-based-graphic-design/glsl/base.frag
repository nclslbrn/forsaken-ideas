
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
    st *= 1.2;

    vec3 color = vec3(.94, .90, .93) - noise2D(st*300., u_noiseSeed)*.1;

    for (int i = 0; i <= int(MAX_CELL); i++) {
        if (i < u_numCell) {
            vec2 cellPos = vec2(0.1) + vec2(u_cells[i].xy);
            vec2 cellSiz = vec2(u_cells[i].zw);
            vec2 stToCell = st - cellPos;
            int j = int(mod(float(i), 4.));
            if (abs(st.y - cellPos.y) <= cellSiz.y * .5) {
                if (abs(st.x - cellPos.x) <= cellSiz.x * .5) {
                    if (j == 1) {
                        stToCell.x += cellSiz.x;
                    }
                    if (j == 2) {
                        stToCell += cellSiz;
                    }
                    if (j == 3) {
                        stToCell.y += cellSiz.y;
                    }
                    float d = sdCircle(
                            stToCell,
                            min(cellSiz.x, cellSiz.y)
                            // (mod(float(i), 2.) > 0.
                            // ? cellSiz.x : cellSiz.y) * .5
                    );
                    float rep = abs(sdfRep(d, .33) - .66);
                    if (rep < .66) color *= 0.2;
                }
            }
        }
    }

    gl_FragColor = vec4(color, 1.0);
}
