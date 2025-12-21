precision mediump float;

uniform vec2 u_resolution;
uniform int u_shapeType;      // 0: sphere, 1: cube
uniform vec3 u_shapePos;
uniform float u_shapeSize;
uniform vec3 u_shapeRot;      // rotation in radians (x, y, z)
uniform vec3 u_lightPos;

// Create rotation matrix from Euler angles
mat3 rotationMatrix(vec3 rot) {
    float cx = cos(rot.x);
    float sx = sin(rot.x);
    float cy = cos(rot.y);
    float sy = sin(rot.y);
    float cz = cos(rot.z);
    float sz = sin(rot.z);

    // Rotation around X axis
    mat3 rx = mat3(
        1.0, 0.0, 0.0,
        0.0, cx, -sx,
        0.0, sx, cx
    );

    // Rotation around Y axis
    mat3 ry = mat3(
        cy, 0.0, sy,
        0.0, 1.0, 0.0,
        -sy, 0.0, cy
    );

    // Rotation around Z axis
    mat3 rz = mat3(
        cz, -sz, 0.0,
        sz, cz, 0.0,
        0.0, 0.0, 1.0
    );

    return rz * ry * rx;
}

// Signed Distance Function for sphere
float sdSphere(vec3 p, float r) {
    return length(p) - r;
}

// Signed Distance Function for box/cube
float sdBox(vec3 p, vec3 b) {
    vec3 q = abs(p) - b;
    return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0);
}

// Main scene SDF
float sceneSDF(vec3 p) {
    // Transform point to local space (apply rotation and translation)
    vec3 localP = rotationMatrix(u_shapeRot) * (p - u_shapePos);

    if (u_shapeType == 0) {
        // Sphere
        return sdSphere(localP, u_shapeSize);
    } else {
        // Cube
        return sdBox(localP, vec3(u_shapeSize));
    }
}

// Calculate surface normal using gradient
vec3 calcNormal(vec3 p) {
    float eps = 0.001;
    vec2 h = vec2(eps, 0.0);
    return normalize(vec3(
        sceneSDF(p + h.xyy) - sceneSDF(p - h.xyy),
        sceneSDF(p + h.yxy) - sceneSDF(p - h.yxy),
        sceneSDF(p + h.yyx) - sceneSDF(p - h.yyx)
    ));
}

void main() {
    // Normalize coordinates
    vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution) / u_resolution.y;

    // Camera setup
    vec3 ro = vec3(0.0, 0.0, 2.0);  // ray origin
    vec3 rd = normalize(vec3(uv, -1.0));  // ray direction

    // Raymarching
    float t = 0.0;
    float maxDist = 10.0;
    bool hit = false;

    for (int i = 0; i < 100; i++) {
        vec3 p = ro + rd * t;
        float d = sceneSDF(p);

        if (d < 0.001) {
            hit = true;
            break;
        }

        if (t > maxDist) break;

        t += d;
    }

    float color = 0.0;

    if (hit) {
        vec3 p = ro + rd * t;
        vec3 normal = calcNormal(p);
        vec3 lightDir = normalize(u_lightPos - p);

        // Diffuse lighting
        float diff = max(dot(normal, lightDir), 0.0);

        // Ambient lighting
        float ambient = 0.2;

        // Specular lighting (Phong)
        vec3 viewDir = normalize(ro - p);
        vec3 reflectDir = reflect(-lightDir, normal);
        float spec = pow(max(dot(viewDir, reflectDir), 0.0), 32.0);

        // Combine lighting components
        color = ambient + diff * 0.7 + spec * 0.3;
    }

    gl_FragColor = vec4(vec3(color), 1.0);
}
