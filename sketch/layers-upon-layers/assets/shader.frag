#ifdef GL_ES
precision highp float;
#endif

uniform vec2 u_resolution;
uniform float u_time;
uniform float u_noiseSize;

vec2 hash22(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * vec3(.1031, .1030, .0973));
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.xx + p3.yz) * p3.zy);
}

float noise2D(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);

    return mix(
        mix(dot(hash22(i + vec2(0.0, 0.0)), f - vec2(0.0, 0.0)),
            dot(hash22(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0)), u.x),
        mix(dot(hash22(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0)),
            dot(hash22(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0)), u.x),
        u.y);
}

vec2 wrapPosition(vec2 pos, float time) {
    float noiseScale = u_noiseSize;
    float wrapStrength = .2;

    vec2 noisePos = 0.5 + pos * noiseScale + time;
    float n1 = noise2D(noisePos + vec2(2.3, 0.8));
    float n2 = noise2D(noisePos + vec2(5.2, 1.3));

    float angle = n1 * 2.0 * 3.14159;
    vec2 displacement = vec2(cos(angle), sin(angle)) * wrapStrength;
    displacement += vec2(n2, n1) * wrapStrength;

    float distanceFromCenter = distance(pos, vec2(0.5));
    float falloff = smoothstep(.75, 0., distanceFromCenter);

    return pos + displacement * falloff;
}

float sdfRep(float x, float r) {
    x /= r;
    x -= floor(x) + .5;
    x *= r;
    return x;
}

float posterize(float l) {
    return l > 0.5 ? 1.0 : 0.;
}

float frame(vec2 st, float s) {
    float sh = s * (u_resolution.y/u_resolution.x); 
    float distLeft = st.x - sh;
    float distRight = (1. - sh) - st.x;
    float distBottom = (1. - st.y) - s;
    float distTop = st.y - s;
    float minDist = min(min(distLeft, distRight), min(distBottom, distTop));
    return smoothstep(0.0, s * 5., minDist);
}

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    //st.y *= u_resolution.x/u_resolution.y;
    float time = u_time * 0.001;
    // Apply wrapping
    vec2 wrappedUv = wrapPosition(st, time);

    // grid
    float edge = 0.05;
    float grid = min(
            step(edge * .1, mod(wrappedUv.x, edge)),
            step(edge * .1, mod(wrappedUv.y, edge))
        );
    vec2 wrappedMirror = wrappedUv * 2. - 1.;
    float repGrid = abs(
            sdfRep(length(vec2(grid) - wrappedMirror), 0.45)
                - 0.666
        );
    float gridBaW = min(posterize(grid), posterize(repGrid));
    /* nord version
        vec3 colorOne = vec3(0.3, 0.34, 0.42);
        vec3 colorTwo = vec3(0.64, 0.75, 0.55);
        vec3 colorThree = vec3(0.23, 0.26, 0.32);
        vec3 colorFour = vec3(0.51, 0.63, 0.76);
        */
    vec3 colorOne = vec3(0.99, 0.9, 0.9);
    vec3 colorTwo = vec3(.3);
    vec3 colorThree = vec3(.15);
    vec3 colorFour = vec3(0.3);

    vec3 back = mix(colorOne, colorFour, repGrid);
    vec3 upon = mix(back, colorThree, 1. - gridBaW * 1.436);
    float droplet = posterize(
            abs(
                sdfRep(
                    smoothstep(
                        .66,
                        0.,
                        noise2D(wrappedMirror * u_noiseSize * 4.)
                    ),
                    .23
                ) - .54
            )
        );
    vec3 layer = mix(colorTwo, vec3(1.), droplet);
    vec3 final = min(layer, upon);
    vec3 framed = max(final, mix(vec3(1.), vec3(0.), frame(st, .005)));
    gl_FragColor = vec4(framed, 1.0);
}
