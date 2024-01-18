#ifdef GL_ES
  precision mediump float;
#endif

#define PI 3.14159265359

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;
uniform vec3 u_part[24];

float sdCircle(vec2 p,float r){
  return length(p)-r;
}
float ease_x(float n) { // normalized Hermite h10
  return n*(1.-n)*(1.-n)*27./4.;
}
float nd(float n) { // normal dist (σ=0.01,μ=0.0)
	return exp(-n*n/0.0002)/sqrt(PI*0.0002);
}

float ease_y(float n) { // easeOutExpo modified by nd
  float expo = -pow(2., -10. * n) + 1.;
  return expo - 0.04*nd(n);
}
void main() { 
  vec2 st =gl_FragCoord.xy/u_resolution.xy;
  vec2 p=(2.*gl_FragCoord.xy - u_resolution.xy)/u_resolution.y; 
  
  float d = 1.0;
  vec3 globalCol = vec3(0.0);

  for (int i = 0; i < 24; i++) {
  
    vec3 c = vec3(u_part[i]);
    float dist = distance(c.xy, st);
    d = min(d, dist);
  }
  vec3 depth = vec3(ease_x(d));
  gl_FragColor = vec4(depth, 1.0 );
}

