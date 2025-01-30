
precision highp float;

#define MAX_CELL 128.0
#define PI 3.1415926535897932384626433832795

uniform vec2 u_resolution;
uniform float u_noiseSize;
uniform float u_noiseSeed;
uniform float u_time;
uniform int u_numCell;
uniform vec4 u_cells[int(MAX_CELL)];

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

mat3 rotateY(float theta) {
    float c = cos(theta);
    float s = sin(theta);
    return mat3(
        vec3(c, 0, s), vec3(0, 1, 0), vec3(-s, 0, c)
    );
}
mat3 rotateX(float theta) {
    float c = cos(theta);
    float s = sin(theta);
    return mat3(
        vec3(1, 0, 0), vec3(0, c, -s), vec3(0, s, c)
    );
}
float sdBoxFrame(vec3 p, vec3 b, float e) {
    p = abs(p) - b;
    vec3 q = abs(p + e) - e;
    return min(min(
            length(max(vec3(p.x, q.y, q.z), 0.0)) + min(max(p.x, max(q.y, q.z)), 0.0),
            length(max(vec3(q.x, p.y, q.z), 0.0)) + min(max(q.x, max(p.y, q.z)), 0.0)),
        length(max(vec3(q.x, q.y, p.z), 0.0)) + min(max(q.x, max(q.y, p.z)), 0.0));
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
float map(vec3 p) {
    return min(
        100.,
        sdBoxFrame(rotateX(u_time * 0.5 * PI) * p, vec3(.2), .025)
    );
}

vec3 calcNormal(vec3 p) {
    const float h = 0.0001;
    const vec2 k = vec2(1, -1);
    return normalize(
        k.xyy * map(p + k.xyy * h) +
            k.yyx * map(p + k.yyx * h) +
            k.yxy * map(p + k.yxy * h) +
            k.xxx * map(p + k.xxx * h)
    );
}

void main() {
    vec2 st = (gl_FragCoord.xy / u_resolution.xy) * 2.0 - 1.0;
    st.x *= u_resolution.x / u_resolution.y;
    vec3 paper = vec3(.94, .90, .93);
    float badTexture = max(noise2D(st * 100., u_noiseSeed), noise2D(st * 300., u_noiseSeed)) * .07;
    vec3 color = paper - badTexture;
    float back = 1.;
    float t = 0.0;
    vec2 st_ = vec2(st.x, fract(.5*st.y + u_time));
    for (int i = 0; i <= int(MAX_CELL); i++) {
        if (i < u_numCell) {
            vec2 cellPos = u_cells[i].xy;
            vec2 cellSiz = u_cells[i].zw;
            if (abs(st_.y - cellPos.y) <= cellSiz.y * .5) {
                if (abs(st_.x - cellPos.x) <= cellSiz.x * .5) {
                    vec2 stToCell = abs(st_ - cellPos);
                    float d = sdBox(stToCell, cellSiz);
                    float rep = abs(sdfRep(d, .05) - .1);
                    if (rep > .1) back *= .3;
                }
            }
        }
    }
     vec3 camPos = vec3(0, 0, -1);
    vec3 lightPos = vec3(1.5, 1., -1.0);
    vec3 rayDir = normalize(vec3(st, 1.0));

    for (int i = 0; i < 100; i++) {
        vec3 p = camPos + rayDir * t;
        float dist = map(p);
        if (dist < 0.01) {
            vec3 normal = calcNormal(p);
            vec3 lightDir = normalize(lightPos - p);
            color = dot(normal, lightDir) > .5 ? paper : color * .1;
            break;
        }
        color *= back;

        if (t > 20.0) break;
        t += dist;
    }
    //d = abs(sdfRep(d, .01) -.02);

    // if (d > .02) color *= .3;
    gl_FragColor = vec4(color - pow(length(st), 2.)*.2, 1.0);
  
}
