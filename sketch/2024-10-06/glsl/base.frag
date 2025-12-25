precision mediump float;

#define MAX_SDF 13
uniform vec2 u_resolution;
uniform int u_shapeCount;

uniform int  u_shapeType[MAX_SDF];
uniform vec3 u_shapePos[MAX_SDF];
uniform vec3 u_shapeRot[MAX_SDF];
uniform vec3 u_shapeSize[MAX_SDF];

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

float sdBox(vec3 p, vec3 b) {
    vec3 q = abs(p) - b;
    return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0);
}

float sdTorus(vec3 p, vec2 t){
  vec2 q = vec2(length(p.xz)-t.x,p.y);
  return length(q)-t.y;
}

float sdCappedCylinder(vec3 p, float r, float h){
  vec2 d = abs(vec2(length(p.xz),p.y)) - vec2(r,h);
  return min(max(d.x,d.y),0.0) + length(max(d,0.0));
}

float sdCutHollowSphere(vec3 p, float r, float h, float t){
  float w = sqrt(r*r-h*h);
  vec2 q = vec2( length(p.xz), p.y );
  return ((h*q.x<w*q.y)
    ? length(q-vec2(w,h))
    : abs(length(q)-r) ) - t;
}

float sdTriPrism(vec3 p, vec2 h){
  vec3 q = abs(p);
  return max(q.z-h.y,max(q.x*0.866025+p.y*0.5,-p.y)-h.x*0.5);
}

float sdfByType(int type, vec3 p, vec3 size) {

    if (type == 0) return sdBox(p, size);
    if (type == 1) return sdTorus(p, vec2(size.x, size.y * 0.35));
    if (type == 2) return sdCappedCylinder(p, size.x, size.y);
    if (type == 3) return sdCutHollowSphere(p, size.x, size.y * 0.5, size.z * 0.3);
    if (type == 4) return sdTriPrism(p, size.xy);


    return sdBox(p, size);
}

float sceneSDF(vec3 p) {
    float d = 1e6;

    for (int i = 0; i < MAX_SDF; i++) {
        if (i >= u_shapeCount) break;

        vec3 lp = rotationMatrix(u_shapeRot[i]) * (p - u_shapePos[i]);
        float di = sdfByType(u_shapeType[i], lp, u_shapeSize[i]);

        d = min(d, di);
    }
    return d;
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

    for (int i = 0; i < 200; i++) {
        vec3 p = ro + rd * t;
        float d = sceneSDF(p);

        if (d < 0.0001) {
            hit = true;
            break;
        }

        if (t > maxDist) break;
        t += d;
    }

    vec3 color = vec3(0.5); // neutral normal background

    if (hit) {
        vec3 p = ro + rd * t;
        vec3 normal = calcNormal(p);
        color = normal * 0.5 + 0.5;
    }

    gl_FragColor = vec4(color, 1.0);
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
