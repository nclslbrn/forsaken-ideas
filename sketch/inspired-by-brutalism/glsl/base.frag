
#ifdef GL_ES
precision lowp float;
#endif

#define MAX_CUBE 36

uniform vec2 u_resolution;
uniform float u_time;
uniform int u_cubeNum;
uniform vec3 u_cubePos[int(MAX_CUBE)];
uniform vec3 u_cubeSiz[int(MAX_CUBE)];

// 3D noise function
float noise(vec3 p) {
    return fract(sin(dot(p, vec3(12.9898, 78.233, 45.164))) * 4374.);
}
// Signed distance function (credit Inigo Quilez)
float sdCube(vec3 p, vec3 b) {
    vec3 q = abs(p) - b;
    return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0);
}

float sdBox(vec2 p, vec2 b) {
    vec2 d = abs(p) - b;
    return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0);
}

float sdCross(vec3 p) {
    float da = sdBox(p.xy, vec2(1.0));
    float db = sdBox(p.yz, vec2(1.0));
    float dc = sdBox(p.zx, vec2(1.0));
    return min(da, min(db, dc));
}
// Rotation matrix for Y-axis
mat3 rotateY(float angle) {
    float s = sin(angle);
    float c = cos(angle);
    return mat3(
        c, 0, s,
        0, 1, 0,
        -s, 0, c
    );
}
// Distance to scene
float map(vec3 p) {
    float minDist = 100.0;

    // Generate multiple cubes
    for (int i = 0; i < int(MAX_CUBE); i++) {
        if (i < u_cubeNum) {
            float cubeDist = sdCube(p - u_cubePos[i], u_cubeSiz[i]);
            minDist = min(minDist, cubeDist);
        }
    }
    // Based on the Menger Spone implementation by Inigo Quilez
    // https://iquilezles.org/articles/menger/
    float s = 8.;
    vec3 a = mod(p * s, 2.0) - 1.0;
    s *= 3.0;
    vec3 r = 1.0 - 3.0 * abs(a);
    float c = sdCross(r) / s;
    minDist = max(minDist, c);

    // ground
    minDist = min(minDist, sdCube((p - vec3(0., -4.15, 0.))*rotateY(radians(45.)), vec3(8., .3, 8.)));

    return minDist;
}

// Calculate surface normal
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

// Soft shadow calculation
float softShadow(vec3 ro, vec3 rd, float mint, float maxt, float k) {
    float res = 1.0;
    float t = mint;

    for (int i = 0; i < 12; i++) {
        float h = map(ro + rd * t);
        res = min(res, k * h / t);
        t += clamp(h, 0.01, 0.2);

        if (h < 0.001 || t > maxt) break;
    }

    return clamp(res, 0., 1.0);
}

void main() {
    vec2 st = (gl_FragCoord.xy / u_resolution.xy) * 2.0 - 1.0;
    st.x *= u_resolution.x / u_resolution.y;

    vec3 camPos = vec3(4., 0., -4);
    vec3 lightPos = vec3(8., 4., -8.0);
    lightPos = rotateY(-u_time) * lightPos;

    vec3 rayDir = normalize(rotateY(radians(45.)) * vec3(st, 1.0));

    float t = 0.0;
    // Background color
    vec3 color = mix(vec3(.22, .27, .28), vec3(.35, .6, .7), st.y);

    // Raymarching
    for (int i = 0; i < 100; i++) {
        vec3 p = camPos + rayDir * t;
        float dist = map(p);

        if (dist < 0.01) {
            // Surface hit, calculate lighting
            vec3 normal = calcNormal(p);
            vec3 lightDir = normalize(lightPos - p);

            // Diffuse lighting
            float diffuse = max(dot(normal, lightDir), 0.4);
            // Shadow calculation
            float shadow = softShadow(p, lightDir, 0.02, 1.5, 4.0);
            // Low computation texture
            float tex = .33 * step(noise(vec3(st.x, st.y, dist * 3.) * 100.), .5) + .66;
            color = vec3(0.6, 0.6, 0.7) * diffuse * shadow * tex;
            break;
        }

        if (t > 20.0) break;
        t += dist;
    }

    gl_FragColor = vec4(color, 1.0);
}
