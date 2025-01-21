precision highp float;

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;
uniform float u_noiseSeed;

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

// SDF Primitives
float sdBox(vec2 p, vec2 b) {
    vec2 d = abs(p) - b;
    return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0);
}

float sdCircle(vec2 p, float r) {
    return length(p) - r;
}

float sdfRep(in float x, in float r) {
    x /= r;
    x -= floor(x) + .5;
    x *= r;
    return x;
}
// Smoothed min function for soft unions
float smin(float a, float b, float k) {
    float h = max(k - abs(a - b), 0.0) / k;
    return min(a, b) - h * h * k * 0.25;
}

// Modified getWall function using SDFs
float getWall(vec2 p) {
    
    float d = noise2D(p*16., u_noiseSeed);
    return d;
}

// Modified ray marching using SDF
float rayMarch(vec2 rayOrigin, vec2 rayDir) {
    float dist = 0.0;

    for (int i = 0; i < 96; i++) {
        vec2 p = rayOrigin + rayDir * dist;

        // Get distance to nearest wall
        float d = getWall(p);

        // If we're very close to a wall, we've hit it
        if (d > .5) {
            return dist;
        }

        // Step forward by the distance to nearest wall
        // This is more efficient than fixed steps
        dist += .05;

        // Break if we've gone too far
        if (dist > 5.0) break;
    }

    return 5.0;
}

void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / min(u_resolution.x, u_resolution.y);
    vec2 mouse = vec2(cos(u_time), sin(u_time)) * .33;

    // Get wall SDF value for current pixel
    float d = getWall(uv);

    // Visualize the SDF field
    vec3 color = vec3(d > .5 ? vec3(0., .1, .1) : vec3(1., .9, .85));

    // Add distance field visualization
    color = mix(vec3(.0), vec3(.7), color);

    vec2 rayDir = normalize(uv - mouse);
    float dist = rayMarch(mouse, rayDir);
    float light = .1 + dist * dist * 5.;

    color *= light;
    float cursor = smoothstep(0.011, 0.001, length(uv - mouse));
    color = max(color, vec3(cursor));

    gl_FragColor = vec4(color, 1.0);
}
