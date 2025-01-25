precision lowp float;

#define PI 3.1415926535897

uniform vec2 u_resolution;
uniform float u_time;
uniform float u_noiseSize;
uniform float u_noiseSeed;
// By Inigo Quilez
// https://iquilezles.org/articles/distfunctions2d/
float ndot(vec2 a, vec2 b) {
    return a.x * b.x - a.y * b.y;
}
// Unidentified source, probably Piter Pasma
float sdfRep(in float x, in float r) {
    x /= r;
    x -= floor(x) + .5;
    x *= r;
    return x;
}


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
    vec2 displacement = vec2(cos(angle), sin(angle)) * .15;
    displacement += vec2(n2, n1) * .15;
    float distanceFromCenter = distance(pos, vec2(.5));
    float falloff = smoothstep(1., .05, distanceFromCenter);
    return pos + displacement * falloff;
}

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    vec2 bl = step(vec2(0.05), st);
    vec2 tr = step(vec2(0.05), 1.0 - st);
    float scale = 50.;
    st = wrapPosition(st);
    st *= scale;

    vec3 bg = vec3(.98, .93, .95);
    vec3 fg = vec3(0.2);

    float fill = bl.x * bl.y * tr.x * tr.y;
    vec2 o = st - (scale*.5);
    float angle = atan(o.y, o.x);
    float l = length(o);
    float offset = abs(o.x) + abs(o.y) + (angle / (2. * PI));
    float circles = mod(offset - u_time, 1.);
    float stroke = circles > .5 ? 0. : 1.;

    fill = min(fill, stroke);
    vec3 color = mix(bg, fg, fill);
    gl_FragColor = vec4(color, 1.0);
}
