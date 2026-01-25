precision highp float;

#ifdef GL_ES
precision lowp float;
#endif

#define MAX_STEPS 128
#define MAX_DIST 100.0
#define SURF_DIST 0.001

#define MAX_CELLS 256
#define MAX_LIGHTS 12

uniform vec2 u_resolution;

// cell data
uniform vec4 u_cells[MAX_CELLS];     // x, y, w, h
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


// Signed distance function (credit Inigo Quilez)
float sdCube(vec3 p, vec3 b) {
    vec3 q = abs(p) - b;
    return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0);
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

    for (int i = 0; i < MAX_CELLS; i++) {
        if (i >= u_cellCount) break;

        vec4 c = u_cells[i];

        float depth = mix(u_depthA, u_depthB, u_cellType[i]);

        vec3 center = vec3(
            c.x + c.z * 0.5,
            c.y + c.w * 0.5,
            depth
        );

        vec3 size = vec3(c.z, c.w, 0.5); // thickness

        float dBox = sdCube(p - center, size * 0.5);

        if (dBox < d) {
            d = dBox;
            hitCell = i;
        }
    }

    return vec4(d, 1.0, 1.0, 1.0);
}

vec3 calcNormal(vec3 pos) {
    vec3 eps = vec3(.001, 0., 0.);
    return normalize(vec3(
            map(pos + eps.xyy).x - map(pos - eps.xyy).x,
            map(pos + eps.yxy).x - map(pos - eps.yxy).x,
            map(pos + eps.yyx).x - map(pos - eps.yyx).x));
}

vec4 intersect(vec3 ro, vec3 rd) {
    vec2 bb = iBox(ro, rd, vec3(8.05));
    if (bb.y < bb.x) return vec4(-1.0);

    float tmin = bb.x;
    float tmax = bb.y;

    float t = tmin;
    vec4 res = vec4(-1.0);
    for (int i = 0; i < 64; i++) {
        vec4 h = map(ro + rd * t);
        if (h.x < 0.002 || t > tmax) break;
        res = vec4(t, h.yzw);
        t += h.x;
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
    vec3 evrfrst[6];
    evrfrst[0] = vec3(.28, .32, .35);
    evrfrst[1] = vec3(.14, .16, .18);
    evrfrst[2] = vec3(.31, .35, .37);
    evrfrst[3] = vec3(.65, .75, .5);
    evrfrst[4] = vec3(.24, .28, .3);
    evrfrst[5] = vec3(.14, .16, .18);

    vec3 rayOrigin = vec3(0.5, 0.5, -0.75);

    vec3 rayDir = normalize(vec3(st, 1.0));
    vec3 col = evrfrst[5];
    vec4 tmat = intersect(rayOrigin, rayDir);

    if (tmat.x > 0.) {
        vec3 pos = rayOrigin + tmat.x * rayDir;
        vec3 nor = calcNormal(pos);
        vec3 matcol = evrfrst[0];
        int colIdx = int(floor(tmat.z * 5.));
        if (colIdx==1) matcol = evrfrst[1];
        if (colIdx==2) matcol = evrfrst[2];
        if (colIdx==3) matcol = evrfrst[3];
        if (colIdx==4) matcol = evrfrst[4];
        if (colIdx==5) matcol = evrfrst[5];
        //  0.5 + 0.5 * cos(vec3(0.0, 1.0, 2.0) + 2.0 * tmat.z);

        float occ = tmat.y * 4.;

        const vec3 light = normalize(vec3(.5, .5, -6.));
        float dif = dot(nor, light);
        float sha = 1.;
        if (dif > 0.) sha = softshadow(pos, light, .01, 64.);
        dif = max(dif, 0.);
        vec3 hal = normalize(light - rayDir);
        float spe = dif * sha *
                pow(clamp(dot(hal, nor), 0., 1.), 16.) *
                (.3 + .7 * pow(clamp(1. - dot(hal, light), 0., 1.), 5.));

        float sky = 0.5 + 0.5 * nor.y;
        float bac = max(
                0.1 + 0.9 * dot(nor, vec3(-light.x, light.y, -light.z)),
                0.0);

        vec3 lin = vec3(0.0);
        lin += 1. * dif * vec3(1.1, .85, .6) * sha;
        lin += .5 * sky * vec3(.1, .2, .4) * occ;
        lin += .1 * bac * vec3(1., 1., 1.) * (.5 + .5 * occ);
        lin += .25 * occ * vec3(.15, .17, .2);
        col = matcol * lin + spe * 128.0;
    }
    col = 1.5 * col / (1. + col);
    col = sqrt(col);
    gl_FragColor = vec4(col, 1.);
}
