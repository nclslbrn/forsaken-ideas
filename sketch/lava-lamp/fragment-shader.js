export default `
#ifdef GL_ES
  precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;
uniform vec3 u_part[24];

float sdCircle(vec2 p,float r){
  return length(p)-r;
}

void main() { 
  vec2 st =gl_FragCoord.xy/u_resolution.xy;
  vec2 p=(2.*gl_FragCoord.xy - u_resolution.xy)/u_resolution.y;
  
  float d = 1.0;
  
  for (int i = 0; i < 24; i++) {
    vec3 c = vec3(u_part[i]);
    float dist = smoothstep(0.5, 0.8, distance(c.xy, st) / c.z);
    d = min(d, dist);
  }
  gl_FragColor = vec4(vec3(0.8-d), 1.0 );
}
`
