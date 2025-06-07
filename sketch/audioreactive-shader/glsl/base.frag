precision highp float;
        
uniform vec2 u_resolution;
uniform float u_time;
uniform sampler2D u_freqText;

vec3 hsv2rgb(vec3 c) {
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    vec2 center = vec2(0.5, 0.5);
    
    // Calculate distance and angle from center
    float dist = distance(uv, center);
    float angle = atan(uv.y - center.y, uv.x - center.x);
    
    // Normalize angle to 0-1 range
    float normalizedAngle = (angle + 3.14159) / (2.0 * 3.14159);
    
    // Sample frequency data based on angle
    float freqIndex = normalizedAngle;
    float amplitude = texture2D(u_freqText, vec2(freqIndex, 0.5)).r;
    
    // Create radial visualization
    float radius = 0.1 + amplitude * 0.4;
    float ring = smoothstep(radius - 0.02, radius, dist) - smoothstep(radius, radius + 0.02, dist);
    
    // Create multiple rings
    float ring2 = smoothstep(radius * 0.5 - 0.01, radius * 0.5, dist) - smoothstep(radius * 0.5, radius * 0.5 + 0.01, dist);
    float ring3 = smoothstep(radius * 1.5 - 0.03, radius * 1.5, dist) - smoothstep(radius * 1.5, radius * 1.5 + 0.03, dist);
    
    // Color based on frequency and time
    float hue = normalizedAngle + u_time * 0.1 + amplitude * 0.5;
    float saturation = 0.8 + amplitude * 0.2;
    float brightness = (ring + ring2 * 0.6 + ring3 * 0.4) * (0.5 + amplitude * 0.5);
    
    // Add center glow
    float centerGlow = 1.0 - smoothstep(0.0, 0.3, dist);
    brightness += centerGlow * amplitude * 0.3;
    
    // Add frequency bars around the circle
    float barAngle = floor(normalizedAngle * 64.0) / 64.0;
    float barAmplitude = texture2D(u_freqText, vec2(barAngle, 0.5)).r;
    float barRadius = 0.6 + barAmplitude * 0.3;
    float bar = smoothstep(barRadius - 0.005, barRadius, dist) - smoothstep(barRadius, barRadius + 0.01, dist);
    
    if (bar > 0.0) {
        hue = barAngle + u_time * 0.05;
        brightness = bar * barAmplitude;
    }
    
    // Convert HSV to RGB
    vec3 color = hsv2rgb(vec3(hue, saturation, brightness));
    
    // Add some sparkle effect
    float sparkle = sin(u_time * 10.0 + dist * 50.0 + normalizedAngle * 20.0) * 0.1 * amplitude;
    color += vec3(sparkle);
    
    gl_FragColor = vec4(color, 1.0);
}
