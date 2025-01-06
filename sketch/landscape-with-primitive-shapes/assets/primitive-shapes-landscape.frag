#ifdef GL_ES
precision highp float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

// Noise functions
float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 3.0;
    
    for(int i = 0; i < 5; i++) {
        value += amplitude * noise(p * frequency);
        amplitude *= 0.5;
        frequency *= 2.0;
    }
    
    return value;
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

bool isInDisc(vec2 point, vec2 center, float radius) {
    return distance(point, center) < radius;
}

void main() {
    // Normalize coordinates
    vec2 uv = gl_FragCoord.xy/u_resolution.xy;
    // Center and scale
    uv = uv - vec2(0.5);
    uv = uv * 2.0;
    uv = uv * 0.5;
    uv = uv + vec2(0.5);
    // Apply perspective transformation
    float perspectiveStrength = 0.6;
    vec2 centered = uv - vec2(0.5, 0.5);
    
    // Generate noise and calculate normal
    float noiseVal = fbm(uv * 5.0 + vec2(0., u_time));
    vec3 normal = calculateNormal(uv * 5.0 + vec2(0., u_time), 0.01);

    float z = 1.0 + perspectiveStrength * centered.y; 
    uv = centered / z + vec2(0.5, 0.5) + noiseVal * .1;
    // Light direction (animated)
    vec3 lightDir = normalize(vec3(cos(u_time * 0.1), sin(u_time * 0.1), 1.0));
    float diffuse = max(dot(normal, lightDir), 0.0);
    float shadow = smoothstep(0.2, 0.8, diffuse);
    
    // Trapezoid parameters
    float trapTop = 0.35;
    float trapBottom = 0.8;
    float trapNarrow = 0.5;
    float trapWide = 0.2;
    
    float y = (uv.y - trapTop) / (trapBottom - trapTop);
    // Perspective-adjusted bounds
    float yPerspective = y * (1.0 + 0.3 * (1.0 - y));
    float leftBound = 0.5 - mix(trapNarrow, trapWide, yPerspective);
    float rightBound = 0.5 + mix(trapNarrow, trapWide, yPerspective);
    
    // Initialize color
    vec4 color = vec4(0.0, 0.0, 0.0, 1.0);
    
    // Draw dots if inside trapezoid
    if(uv.x >= leftBound && uv.x <= rightBound && uv.y >= trapTop && uv.y <= trapBottom) {
        float dotSpacing = 0.005;
        vec2 gridPos = floor(uv / dotSpacing) * dotSpacing;
        float dotSize = 0.0007 * (1.0 + shadow);
        
        float perspectiveScale = 1.0 - (y * 0.3);
        if(isInDisc(uv, gridPos + hash(gridPos) * dotSpacing, dotSize * perspectiveScale)) {
            float intensity = diffuse * (0.85 + 0.15 * noiseVal);
            color = vec4(vec3(intensity), 1.0);
        }
    }
    
    gl_FragColor = color;
}
