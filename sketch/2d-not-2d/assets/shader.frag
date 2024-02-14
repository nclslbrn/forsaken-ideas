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
uniform vec2 u_texSize;
uniform sampler2D u_image;
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
  vec4 tex = texture2D(u_image, st);
  gl_FragColor = tex;
}

