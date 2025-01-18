precision lowp float;

uniform vec2 u_resolution;
uniform float u_noiseSize;
uniform float u_noiseSeed;
uniform float u_time;

#define PI 3.1415926535897

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

float noise2D(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;

    p.x += cos(u_time * 0.25);
    p.y += cos(u_time * 0.25);

    for (int i = 0; i < 4; i++) {
        value += smooth_noise(p * frequency, u_noiseSeed) * amplitude;
        amplitude *= 0.5;
        frequency *= 2.0;
    }
    return value;
}

float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 3.0;

    for (int i = 0; i < 4; i++) {
        value += amplitude * noise2D(p * frequency);
        amplitude *= .5;
        frequency *= 3.;
    }

    return value;
}
float sandGrain(vec2 uv, float scale) {
    float fine = noise2D(uv * scale * 4.0) * 0.3;
    float medium = noise2D(uv * scale * 2.0) * 0.5;
    float rough = noise2D(uv * scale) * 0.2;
    
    return (fine + medium + rough) * 0.8;
}

vec3 calculateNormal(vec2 uv, float eps) {
    float c = fbm(uv);
    float r = fbm(uv + vec2(eps, 0.0));
    float l = fbm(uv - vec2(eps, 0.0));
    float t = fbm(uv + vec2(0.0, eps));
    float b = fbm(uv - vec2(0.0, eps));
    return normalize(vec3(
        (r - l) / (2.0 * eps),
        (t - b) / (2.0 * eps),
        0.5
    ));
}

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    float theta = mod(u_time, 2.*PI);
    vec2 nPos = vec2(
       ((st.x + st.y*.01) * u_noiseSize * 0.09), 
       (st.y * u_noiseSize * 3.5)
    );
    vec3 normal = calculateNormal(nPos, 0.01);
    vec3 lightDir = normalize(vec3(.5, .0, 1.0));
    float diffuse = max(dot(normal, lightDir), 0.0);
    float grain = sandGrain(nPos, 150.);
    vec3 sandColor1 = vec3(.5, .73, .7);
    vec3 sandColor2 = vec3(1.);
    vec3 sandColor = mix(sandColor1, sandColor2, grain);
    float grainDiffuse = mix(diffuse, diffuse * (grain + 0.5), 0.8);

    float microShadow = pow(grain, 2.0) * .5;
    grainDiffuse = max(grainDiffuse - microShadow, 0.0);

    vec3 color = sandColor * grainDiffuse;
    
    float ambient = 0.05;
    color += ambient * vec3(.7);
    
    gl_FragColor = vec4(color, 1.0);
}
