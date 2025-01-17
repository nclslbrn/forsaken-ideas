
precision highp float;

#define MAX_CELL 64.0
#define PI 3.14159265358979323846

uniform vec2 u_resolution;
uniform int u_numCell;
uniform vec4 u_cell[int(MAX_CELL)];
uniform float u_noiseSize;
uniform float u_noiseSeed;
uniform float u_hue;

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

//  Function from Iñigo Quiles
//  https://www.shadertoy.com/view/MsS3Wc
vec3 hsb2rgb(in vec3 c) {
    vec3 rgb = clamp(abs(mod(c.x * 6.0 + vec3(0.0, 4.0, 2.0),
                    6.0) - 3.0) - 1.0,
            0.0,
            1.0);
    rgb = rgb * rgb * (3.0 - 2.0 * rgb);
    return c.z * mix(vec3(1.0), rgb, c.y);
}

vec2 wrapPosition(vec2 pos) {
    vec2 noisePos = pos * u_noiseSize;
    float n1 = noise2D(noisePos, u_noiseSeed);
    float n2 = noise2D(noisePos + vec2(5.2, 1.3), u_noiseSeed);
    float angle = n1 * 2.0 * 3.14159;
    vec2 displacement = vec2(cos(angle), sin(angle)) * .225;
    displacement += vec2(n2, n1) * .25;
    float distanceFromCenter = distance(pos, vec2(.5));
    float falloff = smoothstep(.5, .15, distanceFromCenter);
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

    vec3 primary = hsb2rgb(vec3(PI * u_hue, .15, .4));
    vec3 secondary = hsb2rgb(vec3(PI * mod(u_hue + .33, 1.), .7, .25));
    vec3 ternary = hsb2rgb(vec3(PI * mod(u_hue + .66, 1.), .8, .2));
    vec3 darksecary = hsb2rgb(vec3(PI * mod(u_hue + .16, 1.), .8, .6));
    vec3 darkternary = hsb2rgb(vec3(PI * mod(u_hue + .82, 1.), .9, .5));

    vec3 color = vec3(1.);
    float n = noise2D(st * 200., u_noiseSeed);

    for (int i = 0; i <= int(MAX_CELL); i++) {
        if (i < u_numCell) {
            vec2 cellPos = vec2(u_cell[i].xy);
            vec2 cellSiz = vec2(u_cell[i].zw);
            vec2 stToCell = st - cellPos;

            float d = sdBox(abs(stToCell), cellSiz);
            
            if (abs(st.y - cellPos.y) <= cellSiz.y * .5) {
                if (abs(st.x - cellPos.x) <= cellSiz.x * .5) {
                    if (d < 0.) {
                        vec2 _st = fract((st - cellPos) / cellSiz);
                        if (i == 1) {
                            _st = rotate2D(_st, PI * 0.5);
                        } else if (i == 2) {
                            _st = rotate2D(_st, PI * -0.5);
                        } else if (i == 3) {
                            _st = rotate2D(_st, PI);
                        }
                        float tri = step(_st.x, _st.y);
                        float rep = abs(sdfRep(d, .025) - .5);
                        // color = vec3(rep*1.5); 
                        color = tri > .5
                           ? rep + tri > 1.5 ? secondary : primary 
                           : rep + tri < .5 ? ternary : primary;
                        
                        color = rep > .51 ? rep < .54 ? darksecary : color : color;
                        color = rep < .51 ? rep > .50 ? darkternary : color : color;
                    }
                }
            }
            color = d > -.005 ? d < 0.005 ? mix(primary, ternary, abs(d * 40.)) : color : color;
            color = d < .005 ? d > -0.005 ? mix(primary, ternary, abs(d * 40.)) : color : color;
            color = d < 0. ? n < 0.1 ? secondary : color : color;
        }
    }

    vec2 bl = step(vec2(.03), st);
    vec2 tr = step(vec2(.03), 1. - st);
    color = mix(darkternary, color, bl.x * bl.y * tr.x * tr.y);

    gl_FragColor = vec4(color, 1.0);
}
