precision mediump float;

uniform vec2 u_resolution;
uniform int u_shapeType;
uniform vec3 u_shapePos;
uniform float u_shapeSize;
uniform vec3 u_shapeRot;
uniform vec3 u_lightPos;
uniform int u_fractalIterations;

mat3 rotationMatrix(vec3 rot) {
    float cx = cos(rot.x);
    float sx = sin(rot.x);
    float cy = cos(rot.y);
    float sy = sin(rot.y);
    float cz = cos(rot.z);
    float sz = sin(rot.z);

    mat3 rx = mat3(
        1.0, 0.0, 0.0,
        0.0, cx, -sx,
        0.0, sx, cx
    );

    mat3 ry = mat3(
        cy, 0.0, sy,
        0.0, 1.0, 0.0,
        -sy, 0.0, cy
    );

    mat3 rz = mat3(
        cz, -sz, 0.0,
        sz, cz, 0.0,
        0.0, 0.0, 1.0
    );

    return rz * ry * rx;
}

float sdSphere(vec3 p, float r) {
    return length(p) - r;
}

float sdBox(vec3 p, vec3 b) {
    vec3 q = abs(p) - b;
    return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0);
}

float sdMengerSponge(vec3 p, float s) {
    float d = sdBox(p, vec3(s));

    float scale = 1.0;
    vec3 pos = p;

    for (int i = 0; i < 8; i++) {
        if (i >= u_fractalIterations) break;

        vec3 a = mod(pos * scale, 2.0) - 1.0;
        scale *= 2.5;
        vec3 r = abs(1.0 - 2.5 * abs(a));

        float da = max(r.x, r.y);
        float db = max(r.y, r.z);
        float dc = max(r.z, r.x);
        float c = (min(da, min(db, dc)) - 1.0) / scale;

        d = max(d, c);
    }

    return d;
}

float sdTetrahedron(vec3 p, float r) {
    float k = sqrt(2.0);
    return (max(abs(p.x + p.y) - p.z, abs(p.x - p.y) + p.z) - r) / k;
}

float sdSierpinskiPyramid(vec3 p, float s) {
    vec3 pos = p / s;
    float scale = 1.0;

    for (int i = 0; i < 8; i++) {
        if (i >= u_fractalIterations) break;

        if (pos.x + pos.y < 0.0) pos.xy = -pos.yx;
        if (pos.x + pos.z < 0.0) pos.xz = -pos.zx;
        if (pos.y + pos.z < 0.0) pos.zy = -pos.yz;

        pos = pos * 2.0 - vec3(1.0);
        scale *= 2.0;
    }

    return sdTetrahedron(pos, 1.0) / scale * s;
}

float sdMandelbox(vec3 p, float s) {
    vec3 pos = p / s;
    float dr = 1.0;
    float r = length(pos);

    float scale = 2.0;
    float fixedRadius = 1.0;
    float foldingLimit = 1.0;

    for (int i = 0; i < 8; i++) {
        if (i >= u_fractalIterations) break;

        pos = clamp(pos, -foldingLimit, foldingLimit) * 2.0 - pos;

        float r2 = dot(pos, pos);
        if (r2 < fixedRadius * fixedRadius) {
            float temp = (fixedRadius * fixedRadius / r2);
            pos *= temp;
            dr *= temp;
        }

        pos = scale * pos + p / s;
        dr = dr * abs(scale) + 1.0;
    }

    float dist = length(pos) / abs(dr);
    return dist * s;
}

float sdMandelbulb(vec3 p, float s) {
    vec3 pos = p / s;
    vec3 z = pos;
    float dr = 1.0;
    float r = 0.0;
    float power = 8.0;

    for (int i = 0; i < 8; i++) {
        if (i >= u_fractalIterations) break;

        r = length(z);
        if (r > 2.0) break;

        float theta = acos(z.z / r);
        float phi = atan(z.y, z.x);
        dr = pow(r, power - 1.0) * power * dr + 1.0;

        float zr = pow(r, power);
        theta = theta * power;
        phi = phi * power;

        z = zr * vec3(
            sin(theta) * cos(phi),
            sin(phi) * sin(theta),
            cos(theta)
        );
        z += pos;
    }

    return 0.5 * log(r) * r / dr * s;
}

float sceneSDF(vec3 p) {
    vec3 localP = rotationMatrix(u_shapeRot) * (p - u_shapePos);

    if (u_shapeType == 0) {
        return sdSphere(localP, u_shapeSize);
    } else if (u_shapeType == 1) {
        return sdBox(localP, vec3(u_shapeSize));
    } else if (u_shapeType == 2) {
        return sdMengerSponge(localP, u_shapeSize);
    } else if (u_shapeType == 3) {
        return sdSierpinskiPyramid(localP, u_shapeSize);
    } else if (u_shapeType == 4) {
        return sdMandelbox(localP, u_shapeSize);
    } else if (u_shapeType == 5) {
        return sdMandelbulb(localP, u_shapeSize);
    }

    return sdSphere(localP, u_shapeSize);
}

vec3 calcNormal(vec3 p) {
    float eps = 0.0001;
    vec2 h = vec2(eps, 0.0);
    return normalize(vec3(
        sceneSDF(p + h.xyy) - sceneSDF(p - h.xyy),
        sceneSDF(p + h.yxy) - sceneSDF(p - h.yxy),
        sceneSDF(p + h.yyx) - sceneSDF(p - h.yyx)
    ));
}

// normal map
void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution) / u_resolution.y;

    vec3 ro = vec3(0.0, 0.0, 2.0);
    vec3 rd = normalize(vec3(uv, -1.0));

    float t = 0.0;
    float maxDist = 10.0;
    bool hit = false;

    // Adaptive step count - fractals need more iterations
    int maxSteps = u_shapeType >= 2 ? 200 : 100;

    for (int i = 0; i < 200; i++) {
        if (i >= maxSteps) break;

        vec3 p = ro + rd * t;
        float d = sceneSDF(p);

        if (d < 0.0001) {
            hit = true;
            break;
        }

        if (t > maxDist) break;

        t += d;
    }

    vec3 color = vec3(0.0);  // Default background (no hit)

    if (hit) {
        vec3 p = ro + rd * t;
        vec3 normal = calcNormal(p);

        // Encode the normal as an RGB color
        color = (normal * 0.5) + 0.5; // Normalize the normal to [0,1] range
    }

    gl_FragColor = vec4(color, 1.0);  // Return the normal as color
}


/* normal raycasting algorithm
void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution) / u_resolution.y;

    vec3 ro = vec3(0.0, 0.0, 2.0);
    vec3 rd = normalize(vec3(uv, -1.0));

    float t = 0.0;
    float maxDist = 10.0;
    bool hit = false;

    // Adaptive step count - fractals need more iterations
    int maxSteps = u_shapeType >= 2 ? 200 : 100;

    for (int i = 0; i < 200; i++) {
        if (i >= maxSteps) break;

        vec3 p = ro + rd * t;
        float d = sceneSDF(p);

        if (d < 0.0001) {
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

        // Specular lighting
        vec3 viewDir = normalize(ro - p);
        vec3 reflectDir = reflect(-lightDir, normal);
        float spec = pow(max(dot(viewDir, reflectDir), 0.0), 32.0);

        // Ambient occlusion for better depth perception
        float ao = 1.0;
        if (u_shapeType >= 2) {
            float aoSteps = 5.0;
            for (float i = 1.0; i < 6.0; i++) {
                float dist = i * 0.1;
                ao -= (dist - sceneSDF(p + normal * dist)) * 0.15;
            }
            ao = clamp(ao, 0.0, 1.0);
        }

        color = (ambient + diff * 0.7 + spec * 0.3) * ao;
    }

    gl_FragColor = vec4(vec3(color), 1.0);
}
*/
