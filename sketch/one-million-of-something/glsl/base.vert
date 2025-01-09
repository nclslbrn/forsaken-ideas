attribute vec2 a_position;
attribute vec2 a_velocity;
attribute float a_life;

uniform float u_time;
uniform vec2 u_resolution;
varying float v_life;

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
    vec4 c = vec4(-1.24458, -1.25191, -1.815908, -1.90866);
    n.x = sin(c.x * v.y) + c.z * cos(c.x * v.x);
    n.y = sin(c.y * v.x) + c.w * cos(c.y * v.y);
    return n;
}


void main() {
    float time = mod(u_time, a_life); // Reset life on loop
    vec2 position = a_position + (a_velocity * time);
    // Apply aspect ratio correction using resolution
    position = hyperbolic(position, 2.) * .1;
    //position = sinusoidal(position * .1, a_life / 3.);
    position = clifford(position * (u_time * .3)) * .25;
    position *= u_resolution;

    v_life = 1.0 - (time / a_life); // Decrease life over time
    gl_PointSize = v_life * .5; // Shrink as it dies
    gl_Position = vec4(position, 0.0, 1.0);
}
