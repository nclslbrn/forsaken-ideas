// These are necessary definitions that let you graphics card know how to render the shader
#ifdef GL_ES
precision mediump float;
#endif

// In this example we care about where on the canvas the pixel is, so we need to know the size of the canvas.
// This is passed in as a uniform from the sketch.js file.
uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse; 

// Based on Processing ease function
// of @beesandbombs Dave Whyte
// https://gist.github.com/beesandbombs
float ease(float p,float g){
  if(g>.0){
    return p<.5
    ?.5*pow(2.*p,g)
    :1.-.5*pow(2.*(1.-p),g);
  }else{
    return 3.*p*p-2.*p*p*p;
  }
}
// Created by Inigo Quilez
// Distance primitive functions
// https://iquilezles.org/articles/distfunctions/
float dot2(in vec2 v){return dot(v,v);}
float dot2(in vec3 v){return dot(v,v);}
float ndot(in vec2 a,in vec2 b){return a.x*b.x-a.y*b.y;}
float sdCircle(vec2 p,float r){
  return length(p)-r;
}

float sdHexagon(in vec2 p,in float r){
  const vec3 k=vec3(-.866025404,.5,.577350269);
  p=abs(p);
  p-=2.*min(dot(k.xy,p),0.)*k.xy;
  p-=vec2(clamp(p.x,-k.z*r,k.z*r),r);
  return length(p)*sign(p.y);
}
float sdRhombus(in vec2 p,in vec2 b){
  p=abs(p);
  float h=clamp(ndot(b-2.*p,b)/dot(b,b),-1.,1.);
  float d=length(p-.5*b*vec2(1.-h,1.+h));
  return d*sign(p.x*b.y+p.y*b.x-b.x*b.y);
}
// Piter Pasma JS repetition function 
float sdf_rep(float x,float r){
  x/=r;
  x-=floor(x)+.5;
  x*=r;
  return x;
}

void main(){
  // position of the pixel divided by resolution, to get normalized positions on the canvas
  vec2 st=gl_FragCoord.xy/u_resolution.xy;
  // normalized pixel coordinates
  vec2 p=(2.*gl_FragCoord.xy-u_resolution.xy)/u_resolution.y;
  
  // float d=sdHexagon(p,ra);
  float t=ease((u_time<.5?u_time:1.-u_time)*2.,2.);
  float dx=.6+t;
  float mx= 0.5 + (u_mouse.x/u_resolution.x) * 0.1;
  float hex=2. * abs(sdf_rep(sdHexagon(p,t),mx+t*.5))-.05;
  float rb1=abs(sdf_rep(sdRhombus(vec2(p.x-dx,p.y),vec2(hex,.15)),mx))-.25;
  float rb2=abs(sdf_rep(sdRhombus(vec2(p.x+dx,p.y),vec2(hex,.15)),mx))-.25;
  float d=max(rb1,rb2)*2.;
  // coloring
  vec3 shadow=vec3(smoothstep(.001,.999,abs(d + hex)));
  vec3 col=(d>0.)?vec3(1.,1.,1.):vec3(.0,.0,.0);
  gl_FragColor=vec4(mix(col,shadow,.5),1.);
}