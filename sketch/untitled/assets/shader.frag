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
    float scale = float(u_palNum) * 10000.0;
    vec2 stx = vec2(st * scale);

    vec2 ipos = floor(stx);
    vec2 fpos = fract(stx);
    
    float t = sin(mod(u_time * 0.05, 1.) * PI); 
    float mx= 0.5 + (u_mouse.x/u_resolution.x) * 0.1;

    float noise = random(ipos);

    // animation
    vec2 v1 = cos( u_time*0.5 + vec2(0.0,1.00) + 0.0 );
	  vec2 v2 = cos( u_time*0.5 + vec2(0.0,3.00) + 1.5 );
    float th = 0.3*(0.5+0.5*cos(u_time*1.1+1.0));

	  float l = sdOrientedBox(st, v1, v2, th );
    
    float d = abs(sdf_rep(
        // sdCircle(vec2(.5)-st, sin(noise)*th), 
        l,
        sdBox(vec2(.5)-st, vec2(.5))
    )-0.95);

    
    // if (d > 0.1) {
    int col = int( floor(fract(d) * float(u_palNum) ) );
    vec3 palColor = getColor(col);
    // }
    vec3 color = mix(u_background, palColor, vec3(d));
    gl_FragColor = vec4(color, 1.0);
}
