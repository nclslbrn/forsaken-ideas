#ifdef GL_ES
  precision mediump float;
#endif

#define PI 3.14159265359
#define MAX_COLORS 8

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;
uniform int u_palNum;
uniform vec3 u_background;
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
  return fract(sin(dot(st.xy, vec2(12.9898,78.233)))* 43758.5453123);
}

float sdf_rep(float x, float r){
  x/=r;
  x-=floor(x)+.5;
  x*=r;
  return x;
}

vec3 getColor(int num) {
  for (int i = 0; i < MAX_COLORS; i++) {
    if (i >= u_palNum) return u_background;
    if (i == num) return u_palCols[i];
  }
}

void main() {     
  vec2 st = gl_FragCoord.xy/u_resolution.xy; 
  float mx= u_mouse.x/u_resolution.x;
  float scale = 5.;
  vec2 stx = vec2(st * scale);


  // animation
  vec2 v1 = cos( u_time*0.5 + vec2(.0,0.5) + 0.5 );
  vec2 v2 = cos( u_time*0.25 + vec2(.0,0.5) + 0.25 );
  float th = 0.5*(0.75+0.75*cos(u_time*1.1+1.0));

  float l = sdOrientedBox(st, v1, v2, th );

  vec2 ipos = floor(stx);
  vec2 fpos = fract(stx);
  float noise = random(ipos);
  float d = abs(sdf_rep(
      sdCircle(vec2(.5)-st, l*noise)-0.05, 
      sdBox(vec2(.5)-st, vec2(0.5*th))-0.01
  )-0.95);

  int col = int( floor(fract(d) * float(u_palNum) ) );
  float lens = 1. - sin(abs(st.x - 0.5) * abs(st.y - 0.5));
  vec3 back = mix(u_background, vec3(.0), vec3(pow(lens, 3.0)));
  vec3 palColor = mix(back, getColor(col), vec3(sin(d)));
  gl_FragColor = vec4(palColor, 1.0);
}

