attribute vec2 a_position;
attribute vec2 a_velocity;
attribute float a_life;

uniform float u_time;
uniform vec2 u_resolution;
uniform vec4 u_constant;

varying float v_life;

#define PI 3.1415926535897932384626433832795

float random(vec2 _st) {
    return fract(sin(dot(_st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

// 2D Noise based on Morgan McGuire @morgan3d
// https://www.shadertoy.com/view/4dS3Wd
float noise (vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);

    // Four corners in 2D of a tile
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));

    // Smooth Interpolation
    // Cubic Hermine Curve.  Same as SmoothStep()
    vec2 u = f*f*(3.0-2.0*f);
    // u = smoothstep(0.,1.,f);

    // Mix 4 coorners percentages
    return mix(a, b, u.x) +
            (c - a)* u.y * (1.0 - u.x) +
            (d - b) * u.x * u.y;
}

vec2 hyperbolic(vec2 v, float amount) {
  float mag = sqrt(pow(v.x, 2.) + pow(v.y, 2.));
  float r = mag + 1.0e-10;
  float theta = atan(v.y, v.x);
  return vec2(
    amount * sin(theta) / r,
    amount * cos(theta) * r
  );
}

vec2 sinusoidal(vec2 v, float amount) {
  return vec2(amount * sin(v.x), amount * sin(v.y));
}

vec2 clifford(vec2 v) {
    vec2 n = vec2(0.);
    vec4 c = u_constant;
    n.x = sin(c.x * v.y) + c.z * cos(c.x * v.x);
    n.y = sin(c.y * v.x) + c.w * cos(c.y * v.y);
    return n;
}

vec2 julia(vec2 v, float amount) {
  float mag = sqrt(pow(v.x, 2.) + pow(v.y, 2.));
  float r = amount * sqrt(mag);
  float theta = .5 * atan(v.y, v.x) * floor(.5 + 2.*random(v) * PI);
  return vec2(amount * r * cos(theta), amount * r * sin(theta));
}


void main() {
    float time = mod(u_time, a_life);
    vec2 position = a_position + (a_velocity * time);
    position = clifford(hyperbolic(position, 0.5+v_life) * 2.);
    position = clifford(position * u_time + v_life * 2.) * .33;
    position += noise(position*5. + u_time * 2.) * 0.05;
    position = sinusoidal(position, 1.2);
    position *= u_resolution;

    v_life = 1.0 - (time / a_life);
    gl_PointSize = v_life * 2.;
    gl_Position = vec4(position, 0.0, 1.0);
}
