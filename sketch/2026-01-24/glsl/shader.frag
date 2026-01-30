precision highp float;

#ifdef GL_ES
precision lowp float;
#endif

#define MAX_STEPS 128
#define MAX_DIST 5.0
#define SURF_DIST 0.001

#define MAX_CELLS 96
#define MAX_LIGHTS 48

uniform vec2 u_resolution;

// cell data
uniform vec4 u_cells[MAX_CELLS]; // x, y, w, h
uniform float u_cellType[MAX_CELLS]; // 0.0 or 1.0
uniform int u_cellCount;

// depth & color control
uniform float u_depthA; // depth for type 0
uniform float u_depthB; // depth for type 1
uniform vec3 u_colorA;
uniform vec3 u_colorB;

// lights
uniform vec3 u_lightPos[MAX_LIGHTS];
uniform vec3 u_lightColor;
uniform int u_lightCount;

// time
uniform float u_time;

// Signed distance function (credit Inigo Quilez)
float sdCube(vec3 p, vec3 b) {
    vec3 q = abs(p) - b;
    return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0);
}

vec2 iBox(vec3 ro, vec3 rd, vec3 rad) {
    vec3 m = 1.0 / rd;
    vec3 n = m * ro;
    vec3 k = abs(m) * rad;
    vec3 t1 = -n - k;
    vec3 t2 = -n + k;
    return vec2(max(max(t1.x, t1.y), t1.z),
        min(min(t2.x, t2.y), t2.z));
}

vec4 map(vec3 p) {
    float d = MAX_DIST;
    int hitCell = -1;
    float cellType = 0.0;

    for (int i = 0; i < MAX_CELLS; i++) {
        if (i >= u_cellCount) break;

        vec4 c = u_cells[i];

        float depth = mix(u_depthA, u_depthB, u_cellType[i]);

        vec3 center = vec3(
                c.x + c.z * 0.5,
                c.y + c.w * 0.5,
                depth * 0.33
            );

        vec3 size = vec3(c.z * 0.97, c.w * 0.97, .5); // thickness

        float dBox = sdCube(p - center, size * 0.5);

        if (dBox < d) {
            d = dBox;
            hitCell = i;
            cellType = u_cellType[i];
        }
    }

    return vec4(d, 1.0, 1.0, cellType);
}

vec3 calcNormal(vec3 pos) {
    vec3 eps = vec3(.0001, 0., 0.);
    return normalize(vec3(
            map(pos + eps.xyy).x - map(pos - eps.xyy).x,
            map(pos + eps.yxy).x - map(pos - eps.yxy).x,
            map(pos + eps.yyx).x - map(pos - eps.yyx).x)
    );
}

vec4 intersect(vec3 ro, vec3 rd) {
    vec2 bb = iBox(ro, rd, vec3(8.05));
    if (bb.y < bb.x) return vec4(-1.0);

    float tmin = bb.x;
    float tmax = bb.y;

    float t = tmin;
    vec4 res = vec4(-1.0);
    for (int i = 0; i < 128; i++) {
        vec4 h = map(ro + rd * t);
        if (h.x < 0.0001 || t > tmax) break;
        res = vec4(t, h.yzw);
        t += h.x * 0.5;
    }
    if (t > tmax) res = vec4(-1.0);
    return res;
}

float softshadow(in vec3 ro, in vec3 rd, float mint, float k) {
    vec2 bb = iBox(ro, rd, vec3(8.05));
    float tmax = bb.y;

    float res = 1.0;
    float t = mint;
    for (int i = 0; i < 64; i++) {
        float h = map(ro + rd * t).x;
        res = min(res, k * h / t);
        if (res < 0.001) break;
        t += clamp(h, 0.005, 0.1);
        if (t > tmax) break;
    }
    return clamp(res, 0.0, 1.0);
}

void main() {
    vec2 st = (gl_FragCoord.xy / u_resolution.xy) * 2.0 - 1.0;
    st.x *= u_resolution.x / u_resolution.y;

    float camAngle = radians(90.); //u_time * 0.5;
    float camDist = 1.15;
    vec3 rayOrigin = vec3(
            camDist * cos(camAngle),
            0.,
            camDist * sin(camAngle)
        );
    vec3 target = vec3(0.0, 0.0, 0.0);
    vec3 forward = normalize(target - rayOrigin);
    vec3 right = normalize(cross(vec3(0.0, 1.0, 0.0), forward));
    vec3 up = cross(forward, right);

    vec3 rayDir = normalize(forward + st.x * right + st.y * up);

    vec3 col = vec3(0.98);
    vec4 tmat = intersect(rayOrigin, rayDir);

    if (tmat.x > 0.) {
        vec3 pos = rayOrigin + tmat.x * rayDir;
        vec3 nor = calcNormal(pos);
        vec3 matcol = vec3(0.95); // mix(u_colorA, u_colorB, tmat.w);

        float occ = tmat.y * 5.;

        vec3 lin = vec3(0.0);
        vec3 spe = vec3(0.0);

        for (int i = 0; i < MAX_LIGHTS; i++) {
            if (i >= u_lightCount) break;

            vec3 lightPos = u_lightPos[i];
            vec3 lightDir = lightPos - pos;
            float lightDist = length(lightDir);
            lightDir = normalize(lightDir);

            // Attenuation (inverse square falloff)
            float attenuation = 1.0 / (1.0 + lightDist * lightDist * 15.);

            // Diffuse
            float dif = max(dot(nor, lightDir), 0.0);

            // Shadow
            float sha = 1.0;
            if (dif > 0.0) {
                sha = softshadow(pos + nor * 0.001, lightDir, 0.01, 32.);
            }

            // Specular
            vec3 hal = normalize(lightDir - rayDir);
            float spec = dif * sha *
                    pow(clamp(dot(hal, nor), 0., 1.), 16.) *
                    (.3 + .6 * pow(clamp(1. - dot(hal, lightDir), 0., 1.), 5.));

            // Accumulate
            lin += dif * sha * u_lightColor * attenuation;
            spe += spec * u_lightColor * attenuation;
        }
        // Minimal ambient
        lin += vec3(0.02) * occ;
        col = matcol * lin + spe * 64.0;
    }
    col = 1.5 * col / (1. + col);
    col = sqrt(col);
    gl_FragColor = vec4(col, 1.);
}
