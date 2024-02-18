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
uniform vec2 u_noiseOffset;
uniform sampler2D u_image;
uniform vec3 u_palCols[MAX_COLORS];


float frame(in vec2 st, in float border) {
  float l = step(border, st.x);
  float r = step(border, 1.-st.x);
  float b = step(border, st.y);
  float t = step(border, 1.-st.y);
return 1. - (l*r*b*t);
}

float random (in vec2 st) {
    return fract(sin(dot(st.xy,vec2(12.9898,78.233))) * 43758.5453123);
}

// Value noise by Inigo Quilez - iq/2013
// https://www.shadertoy.com/view/lsf3WH
float noise(vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);
    vec2 u = f*f*(3.0-2.0*f);
    return mix( mix( random( i + vec2(0.0,0.0) ),
                     random( i + vec2(1.0,0.0) ), u.x),
                mix( random( i + vec2(0.0,1.0) ),
                     random( i + vec2(1.0,1.0) ), u.x), u.y);
}

mat2 rotate2d(in float _angle){
  return mat2(cos(_angle),-sin(_angle), sin(_angle),cos(_angle));
}

mat2 scale(in vec2 _scale){
  return mat2(_scale.x, .0, .0, _scale.y);
}

float lines(in vec2 pos, float b){
  float scale = 5.;
  pos *= scale;
  return smoothstep(.0, .5 + b*.5, abs((sin(pos.x*PI)+b*2.))*.5);
}

vec3 getColor(in int num) {
  for (int i = -1; i < MAX_COLORS; i++) {
    if (i >= u_palNum) return u_stroke;
    if (i == num) return u_palCols[i];
  }
}

void main() {
    vec2 st = gl_FragCoord.xy/u_resolution.xy;
    // st.x *= u_resolution.x/u_resolution.y;
    
    float rot = u_mouse.x / u_resolution.x;
    float scale = 8.;
    
    vec2 nst = st;
    nst -= vec2(.5);
    nst *= vec2(scale);
	  // nst = rotate2d(rot) * nst;
    nst += vec2(.5);
    
    //float pattern = nst.x;
	  float t = u_time * .00001;
    float r = PI * t;
    vec2 anim = vec2(cos(r) * scale, sin(r) * scale);
    float disp = noise(nst + anim + u_noiseOffset);
    nst.x *= disp;
    
    float casted = fract(ceil(disp*10.) * .1);
    vec3 color = getColor(int(casted * float(u_palNum)));
    vec4 tex = texture2D(u_image, st.xy);
    vec3 final = mix(color, vec3(casted), vec3(.33));
    vec3 invert = mix(color, vec3(1.)-color, tex.xyz);
    float whiteFrame = frame(st, 0.05);
    gl_FragColor = vec4(max(vec3(whiteFrame), invert), 1.0);
}


