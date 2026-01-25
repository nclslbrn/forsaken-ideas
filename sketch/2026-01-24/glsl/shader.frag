precision highp float;

#define MAX_CELLS 256.0

uniform vec2 u_resolution;
uniform vec4 u_cells[int(MAX_CELLS)];
uniform float u_cellType[int(MAX_CELLS)];
uniform int u_cellCount;
uniform vec3 u_bgColor;
uniform vec3 u_cellColor;
uniform vec3 u_borderColor;
uniform float u_borderWidth;

// SDF for a regular rectangle (faster)
float boxSDF(vec2 p, vec2 b) {
    vec2 d = abs(p) - b;
    return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0);
}

// Find the closest cell and return its distance and index
vec2 closestCell(vec2 pixelPos) {
    float minDist = 1e6;
    int closestIdx = -1;

    for (int i = 0; i < int(MAX_CELLS); i++) {
        if (i >= u_cellCount) break;

        vec4 cell = u_cells[i];
        vec2 center = cell.xy + cell.zw * 0.5;
        vec2 halfSize = cell.zw * 0.5;

        // Transform pixel position to cell's local space
        vec2 localPos = pixelPos - center;

        // Calculate SDF distance (negative = inside)
        float dist = boxSDF(localPos, halfSize);
        // For regular rectangles, use: float dist = boxSDF(localPos, halfSize);

        if (dist < minDist) {
            minDist = dist;
            closestIdx = i;
        }
    }

    return vec2(minDist, float(closestIdx));
}

void main() {
    // Convert UV to pixel coordinates
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    // Find closest cell
    vec2 cellInfo = closestCell(st);
    float dist = cellInfo.x;
    int cellIdx = int(cellInfo.y);

    // Anti-aliasing factor
    float antialias = 1.0; // You can make this dynamic based on zoom

    // Calculate border
    float borderAlpha = smoothstep(-u_borderWidth, -u_borderWidth + antialias, -dist);
    float fillAlpha = smoothstep(0.0, antialias, -dist);

    // Default to background
    vec3 color = u_bgColor;

    if (cellIdx >= 0) {
        // Inside a cell
        if (dist < -u_borderWidth) {
            // Inside border region - use cell color
            color = u_cellColor;
        } else if (dist < 0.0) {
            // In border region
            float t = (-dist) / u_borderWidth;
            color = mix(u_borderColor, u_cellColor, t);
        } else {
            // Just outside cell - could highlight with border
            float edge = exp(-dist * 0.5); // Soft edge glow
            color = mix(u_bgColor, u_borderColor, edge * 0.3);
        }
    }

    gl_FragColor = vec4(color, 1.0);

    // Alternative: Distance field visualization (debug)
    // fragColor = vec4(vec3(0.5 - dist * 0.01), 1.0);
}
