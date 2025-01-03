#ifdef GL_ES
precision highp float;
#endif

uniform vec2 u_resolution;
uniform sampler2D u_text;
uniform float u_time;
uniform vec2 u_textSize;
uniform float u_noiseSize;
varying vec2 vTexCoord;
vec2 hash22(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * vec3(.1031, .1030, .0973));
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.xx + p3.yz) * p3.zy);
}

float noise2D(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(dot(hash22(i + vec2(0.0, 0.0)), f - vec2(0.0, 0.0)),dot(hash22(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0)), u.x), mix(dot(hash22(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0)),dot(hash22(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0)), u.x),u.y);
}

vec2 wrapPosition(vec2 pos, float time) {
    vec2 noisePos = pos * u_noiseSize + vec2(time * 3.);
    float n1 = noise2D(noisePos);
    float n2 = noise2D(noisePos + vec2(5.2, 1.3));
    float angle = n1 * 2.0 * 3.14159;
    vec2 displacement = vec2(cos(angle), sin(angle)) * .13;
    displacement += vec2(n2, n1) * .13;
    float distanceFromCenter = distance(pos, vec2(.5));
    float falloff = smoothstep(.5, .0, distanceFromCenter);
    return pos + displacement * falloff;
}

float box(vec2 _st, vec2 _size, float _smoothEdges) {
    _size = vec2(0.5) - _size * 0.5;
    vec2 aa = vec2(_smoothEdges * 0.5);
    vec2 uv = smoothstep(_size, _size + aa, _st);
    uv *= smoothstep(_size, _size + aa, vec2(1.0) - _st);
    return uv.x * uv.y;
}

float frame(vec2 st, float s) {
    float d = min(min(st.x -s, (1. -s) - st.x), min(st.y - s, (1. - s) - st.y));
    return smoothstep(-s, s, d);
}

void main() {
    vec2 st = vec2(vTexCoord.x, 1.0 - vTexCoord.y);
    float time = floor(u_time * .001) + smoothstep(0., 1., mod(u_time * .001, 1.));
    vec2 distortedUV = wrapPosition(st, time);
    vec3 rainbow = sqrt(vec3(mod(3. * noise2D(distortedUV), 1.), mod(noise2D(distortedUV * 2.), 1.), mod(noise2D(distortedUV * 4.), 1.)));

    distortedUV.y -= mod(time, 1.);
    vec2 scaledUv = fract(distortedUV * u_textSize);
    vec2 tile = fract(distortedUV * 14.);
    float textColor = float(texture2D(u_text, scaledUv).r);
    vec3(distortedUV.x, distortedUV.y, 1.);
    vec3 tileColor = mix(
            vec3(.07),
            mod(rainbow - vec3(.33 + time, .66 + time, time), 1.),
            box(vec2(tile.x, tile.y + .5), vec2(1.01, .1), 0.01)
        );

    gl_FragColor = vec4(
            mix(
                vec3(.05),
                max(tileColor, mix(vec3(.1), rainbow, textColor)),
                frame(st, 0.01)
            ),
            1.0
        );
}
