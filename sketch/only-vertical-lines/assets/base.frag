// Author: Nicolas Lebrun
// Title: Vertical or horizontal lines only (genuary 2025 #1)
#ifdef GL_ES
precision highp float;
#endif

uniform vec2 u_resolution;
uniform float u_bandSize;
uniform float u_noiseSize;

float edge = max(u_bandSize / u_resolution.x, 0.0001);
float noiseScale = u_noiseSize;

vec3 mod289(vec3 x) {
    return x - floor(x * (1.0 / 289.0)) * 289.0;
}
vec2 mod289(vec2 x) {
    return x - floor(x * (1.0 / 289.0)) * 289.0;
}
vec3 permute(vec3 x) {
    return mod289(((x * 34.0) + 1.0) * x);
}

float random(in vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
    vec2 i = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1;
    i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
    m = m * m;
    m = m * m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
    vec3 g;
    g.x = a0.x * x0.x + h.x * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
}

float level(vec2 st) {
    float n = 0.0;
    for (float i = 1.0; i < 8.0; i++) {
        float m = pow(2.0, i);
        n += snoise(st * m) * (1.0 / m);
    }
    return n * 0.5 + 0.5;
}

vec3 normal(vec2 st) {
    float d = 0.007;
    float l0 = level(st);
    float l1 = level(st + vec2(d, 0.0));
    float l2 = level(st + vec2(0.0, d));
    return normalize(vec3(-(l1 - l0), -(l2 - l0), d));
}

float frame(vec2 st, float s) {
 vec2 sr = vec2(s); 
  vec2 bl = step(sr, st);
  vec2 tr = step(sr, 1.0-st);
  return tr.x * tr.y * bl.x * bl.y;
}

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;

    float crop = frame(st, 0.01);
    vec3 back = vec3(0.99, 0.9, 0.9);
    vec3 black = vec3(0.1, 0.1, 0.1);

    vec3 lightPos = vec3(0.5, 0., 1.5);
    vec3 lightDir = normalize(vec3(lightPos - vec3(st, 0.0) * noiseScale));
    vec2 stStuck = vec2(
            floor(st.x * u_resolution.x) / (u_resolution.x * u_bandSize),
            floor(st.y * u_resolution.y) / (u_resolution.y * u_bandSize)
        );
    float diffuse = clamp(dot(normal(stStuck * noiseScale), lightDir), 0., 1.);

    // backgound band
    float xbandXLarge = abs(step(edge * 1.5, mod(st.x, edge * 3.)));
    vec3 floorColor = min(xbandXLarge, step(.5, abs(.5 - diffuse))) > .0 ? black : back;
    vec3 color = min(xbandXLarge, abs(step(.5, diffuse))) > .0 ? back : floorColor;

    if (diffuse >= 0.16 && diffuse < 0.333333333) {
        float xbandSmall = abs(step(edge * .33, mod(st.x, edge * .66)));
        color = min(xbandSmall, abs(step(.5, 1. - diffuse))) > .0 ? black : floorColor;
    }
    if (diffuse >= 0.33 && diffuse < 0.66) {
        float xbandMedium = abs(step(edge * .5, mod(st.x, edge)));
        color = min(xbandMedium, step(.5, abs(0.25 - diffuse))) > .0 ? black : floorColor;
    }
    if (diffuse >= 0.66) {
        float xbandLarge = abs(step(edge, mod(st.x, edge * 2.)));
        color = min(xbandLarge, abs(step(.5, diffuse))) > .0 ? black : floorColor;
    }
    
    gl_FragColor = vec4(crop > .0 ? color : back, 1.);
}
