// Based on https://www.shadertoy.com/view/3sXSW8 by FabriceNeyret2

#ifdef GL_ES
precision highp float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;
uniform float u_noiseSize;
uniform vec3 u_wallColor;
#define H 2.
#define PI 3.14159265359

vec2 hash22(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * vec3(.1031, .1030, .0973));
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.xx + p3.yz) * p3.zy);
}

float noise2D(vec2 p) {
    vec2 i = floor(p) * u_noiseSize;
    vec2 f = fract(p) * u_noiseSize;
    vec2 u = f * f * (3.0 - 2.0 * f);

    return mix(
        mix(dot(hash22(i + vec2(0.0, 0.0)), f - vec2(0.0, 0.0)),
            dot(hash22(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0)), u.x),
        mix(dot(hash22(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0)),
            dot(hash22(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0)), u.x),
        u.y);
}

#define OCTAVES 6
float fbm(vec2 st) {
    float value = 0.0;
    float amplitud = .5;
    float frequency = 0.;
    for (int i = 0; i < OCTAVES; i++) {
        value += amplitud * noise2D(st);
        st *= 2.;
        amplitud *= .5;
    }
    return value;
}

bool c(vec2 st, float x, float y) {
    return noise2D(
        vec2(u_time * .001) +
            vec2(
                1e3 * length(
                        ceil(+st + vec2(x, y)))
            )
    ) > 0.35;
}

mat2 rotate(float a) {
    return mat2(cos(a), -sin(a), sin(a), cos(a));
}

void main() {
    vec2 st = 2. * gl_FragCoord.xy - u_resolution.xy;
    st = st / u_resolution.y * mat2(1., -H, 1., H) / min(1.5, H);
    st *= 3.5; // u_mouse.x * 1.5);
    //st.y += u_time * .0007;
    //st.x += u_time * .0002;

    vec3 shadow = u_wallColor * 0.66;
    vec3 highlight = u_wallColor * 1.33;

    vec2 R = fract(st *= 5.);
    bool r = R.x + R.y > 1.;
    vec3 col = c(st, 1., -1.) ? vec3(.95) // roof
        : c(st, 1., 0.) && r ? highlight // lit SE wall
        : c(st, 0., -1.) && !r ? shadow // shadow SW wall
        : c(st, 0., 0.) ? r ? shadow : highlight // lit SE wall
        : c(st, -1., 0.) ? shadow * 0.33 // shadow
        : u_wallColor * 0.66; // floor

    float rot = c(st, 1., -1.) ? 0. // roof
        : c(st, 1., 0.) && r ? .25 // lit SE wall
        : c(st, 0., -1.) && !r ? -.25 // shadow SW wall
        : c(st, 0., 0.) ? r ? -.25 : .25 // lit SE wall
        : c(st, -1., 0.) ? 0. // shadow
        : 0.; // floor

    //if (rot < PI) {
        vec2 line = step(0.075, mod(st * rotate(PI*rot), 0.5));
        col *= line.y * line.x;
    //}

    gl_FragColor = vec4(vec3(col), 1.);
}
