#ifdef GL_ES
precision lowp float;
#endif

uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;
// Signed distance function (credit Inigo Quilez)
float sdCube(vec3 p, vec3 b) {
    vec3 q = abs(p) - b;
    return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0);
}

float sdSphere(vec3 p, float s) {
    return length(p) - s;
}

float sdBoxFrame(vec3 p, vec3 b, float e) {
    p = abs(p) - b;
    vec3 q = abs(p + e) - e;
    return min(min(
            length(max(vec3(p.x, q.y, q.z), 0.0)) + min(max(p.x, max(q.y, q.z)), 0.0),
            length(max(vec3(q.x, p.y, q.z), 0.0)) + min(max(q.x, max(p.y, q.z)), 0.0)),
        length(max(vec3(q.x, q.y, p.z), 0.0)) + min(max(q.x, max(q.y, p.z)), 0.0));
}

float sdBox(vec2 p, vec2 b) {
    vec2 d = abs(p) - b;
    return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0);
}

float sdTriPrism(vec3 p, vec2 h) {
    vec3 q = abs(p);
    return max(q.z - h.y, max(q.x * 0.866025 + p.y * 0.5, -p.y) - h.x * 0.5);
}

float sdCross(vec3 p, vec3 s) {
    float da = sdBox(p.xy, vec2(s.x, s.y));
    float db = sdBox(p.yz, vec2(s.y, s.z));
    float dc = sdBox(p.zx, vec2(s.z, s.x));
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
mat3 rotateX(float angle) {
    float c = cos(angle);
    float s = sin(angle);
    return mat3(
        vec3(1, 0, 0),
        vec3(0, c, -s),
        vec3(0, s, c)
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
    float d = 100.;
    p *= rotateY(radians(u_mouse.x * 180.));
    //p = abs(p);
    d = min(
            sdBoxFrame(p, vec3(2.5), 0.5),
            sdBoxFrame(p*rotateX(radians(45.)), vec3(2.5), 0.5)
        );
    d = min(
        d,
        sdBoxFrame(p*rotateY(radians(45.)), vec3(2.5), 0.5)
    );
    vec4 res = vec4(d, 1., 0., 0.);

    float s = 1.;
    for (int m = 0; m < 4; m++) {
        vec3 a = mod(p * s, 2.) - 1.;
        s *= 3.;
        vec3 r = abs(2. - 3. * abs(a));
        float rot = (float(m) + 1.) * 90. + 45.;
        vec3 sdpos = rotateX(radians(rot)) * rotateY(rot*2.) * r;

        float c = sdCross(sdpos, vec3(.75)) / s;
        //(min(da, min(db, dc)) - 1.) / s;
        float da = max(r.x, r.y);
        float db = max(r.y, r.z);
        float dc = max(r.z, r.x);

        if (c > d) {
            d = c;
            res = vec4(d, 0.2 * da * db * dc, (1. + float(m)) / 4., 0.);
        }
    }
    return res;
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
    vec3 rayOrigin = vec3(0., 0., -7.);

    vec3 rayDir = normalize(vec3(st, 1.0));
    /*vec3 rayDir = normalize(
            // rotateY(radians(45.)) *
            //rotateX(radians( u_mouse.y * 180.)) *
            vec3(st, 2.0)
        );*/
    vec3 col = evrfrst[5];
    vec4 tmat = intersect(rayOrigin, rayDir);

    if (tmat.x > 0.) {
        vec3 pos = rayOrigin + tmat.x * rayDir;
        vec3 nor = calcNormal(pos);
        vec3 matcol = evrfrst[4];
        int colIdx = int(floor(tmat.z * 5.));
        if (colIdx == 1) matcol = evrfrst[1];
        if (colIdx == 2) matcol = evrfrst[2];
        if (colIdx == 3) matcol = evrfrst[3];
        if (colIdx == 4) matcol = evrfrst[4];
        if (colIdx == 5) matcol = evrfrst[5];
        //  0.5 + 0.5 * cos(vec3(0.0, 1.0, 2.0) + 2.0 * tmat.z);

        float occ = tmat.y * 4.;

        const vec3 light = normalize(vec3(1., .9, .3));
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
