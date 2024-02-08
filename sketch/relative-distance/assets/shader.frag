#ifdef GL_ES
  precision highp float;
#endif

#define PI 3.14159265359
#define MAX_COLORS 8

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;
uniform int u_palNum;
uniform vec3 u_background;
uniform vec3 u_stroke;
uniform vec3 u_palCols[MAX_COLORS];

float sdCircle(vec2 p, float r){
  return length(p)-r;
}

float sdBox(in vec2 p, in vec2 b){
  vec2 d = abs(p)-b;
  return length(max(d,0.0)) + min(max(d.x,d.y),0.0);
}

float sdOrientedBox( in vec2 p, in vec2 a, in vec2 b, float th ){
    float l = length(b-a);
    vec2  d = (b-a)/l;
    vec2  q = (p-(a+b)*0.5);
          q = mat2(d.x,-d.y,d.y,d.x)*q;
          q = abs(q)-vec2(l,th)*0.5;
    return length(max(q,0.0)) + min(max(q.x,q.y),0.0);    
}

float random (vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898,78.233)))* 43758.5453);
}

float sdf_rep(float x, float r){
  x/=r;
  x-=floor(x)+.5;
  x*=r;
  return x;
}

vec3 getColor(int num) {
  for (int i = 0; i < MAX_COLORS; i++) {
    if (i >= u_palNum) return u_stroke;
    if (i == num) return u_palCols[i];
  }
}

void main() {     
  vec2 st = gl_FragCoord.xy/u_resolution.xy; 
  float mx= u_mouse.x/u_resolution.x;
  float scale = 4.;
  vec2 stx = vec2(st * scale);


  // animation
  vec2 v1 = cos( u_time*0.25 + vec2(.0,1.) + .5 );
  vec2 v2 = cos( u_time*0.5 + vec2(.0,.5) + .25 );
  float th = .15*(.95+.15*cos(u_time*1.1+1.0));

  float l = sdOrientedBox(st, v1, v2, th );

  vec2 ipos = floor(stx);
  vec2 fpos = fract(stx);
  float noise = random(ipos);

  float d = abs(sdf_rep(
      sdCircle(vec2(.5)-st, clamp(l*noise, .01, .9)) + .07, 
      sdBox(vec2(.5)-st, vec2(.5 * th)) - .5
  ) - .1);

  int col = int( floor(fract(d) * float(u_palNum) ) );
  vec3 invBack = u_background-1.0;
  float lens = 1. - cos(abs(st.x - .5) * abs(st.y - .5));
  vec3 back = mix(u_background, invBack, lens);
  vec3 palColor = mix(back, getColor(col), d);
  gl_FragColor = vec4(palColor, 1.0);
}

