#ifdef GL_ES
  precision mediump float;
#endif

#define PI 3.14159265359
#define N 64.0

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;
uniform vec3 u_part[int(N)];

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
  vec2 st = gl_FragCoord.xy/u_resolution.xy;
  vec2 p= (2.*gl_FragCoord.xy - u_resolution.xy)/u_resolution.y; 
  //float fade =  
  float d = 1.0;
  vec3 globalCol = vec3(1.0);
  for (int i = 0; i < int(N); i++) {
    vec3 c = vec3(u_part[i]);
    float cc = float(i)/(N/3.0);
    vec3 col = vec3(
      fract(cc+0.25),
      fract(cc+0.5),
      fract(cc+0.75)
    );
    float dist = distance(c.xy, st);
    if (dist < c.z) {
      globalCol = vec3(col);
    }
    d = min(d, dist/c.z);
  }
  globalCol = fract(globalCol);
  // float lens = 1.0 - abs(st.x - 0.5) * abs(st.y - 0.5);
  // vec3 depth = vec3(min(fract(d), lens));
  gl_FragColor = vec4(globalCol, 1.0);
}

