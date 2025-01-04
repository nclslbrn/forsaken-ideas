#ifdef GL_ES
precision highp float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;
uniform vec4 u_constant;

float random(vec2 _st) {
    return fract(sin(dot(_st.xy,
                vec2(12.9898, 78.233))) *
            43758.5453123);
}

float frame(vec2 st, float s) {
    float sy = s * (u_resolution.x / u_resolution.y);
    float d = min(
            min(st.x - s, (1. - s) - st.x),
            min(st.y - sy, (1. - sy) - st.y)
        );
    return smoothstep(-s, s, d);
}

vec2 clifford(vec2 v) {
    vec2 n = vec2(0.);
    n.x = sin(u_constant.x * v.y) + u_constant.z * cos(u_constant.x * v.x);
    n.y = sin(u_constant.y * v.x) + u_constant.w * cos(u_constant.y * v.y);
    return n;
}

void main() {
    vec2 uv = (gl_FragCoord.xy / u_resolution) * 2.0 - 1.0;

    float color = 0.6;
    vec2 pos = uv * .05;

    for (int i = 1; i < 3000; i++) {
        // Map the attractor's position to screen space
        pos = clifford(vec2(pos + vec2(random(pos * float(i / 500)))));
        vec2 screenPos = sin(pos * 1.5);
        // Accumulate color based on distance to current pixel
        float dist = length(uv - screenPos);
        color -= 0.00004 / (dist * dist + (.9 / float(i)));
    }
    color = sqrt(color);
    gl_FragColor = vec4(vec3(mix(.6, color, frame(0.5 + uv * .5, 0.02))), 1.0);
}
