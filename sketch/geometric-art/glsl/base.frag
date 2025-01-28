precision lowp float;

#define MAX_RHOMB 128
#define PI 3.1415926535897

uniform vec2 u_resolution;
uniform float u_time;
// By Inigo Quilez
// https://iquilezles.org/articles/distfunctions2d/
float ndot(vec2 a, vec2 b) {
    return a.x * b.x - a.y * b.y;
}
float sdCircle( vec2 p, float r ){
    return length(p) - r;
}

// Unidentified source, probably Piter Pasma
float sdfRep(in float x, in float r) {
    x /= r;
    x -= floor(x) + .5;
    x *= r;
    return x;
}

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    vec2 bl = step(vec2(0.05), st);
    vec2 tr = step(vec2(0.05), 1.0 - st);
    float wheight = .08;
    float rr = smoothstep(0., .5, mod(u_time, 1.));
    float d = abs(sdfRep(sdCircle(vec2(.5)-st,.3),.03)-.06);
    if (d < wheight) {
      float bl = abs(sdfRep(sdCircle(vec2(.125)-st*2., rr), .05) -.07);
      float br =  abs(sdfRep(sdCircle(vec2(1.875,.125)-st*2., rr), .05) -.07); 
      float tr =  abs(sdfRep(sdCircle(vec2(1.875)-st*2., rr), .05) -.07);
      float tl =  abs(sdfRep(sdCircle(vec2(.125,1.875)-st*2., rr), .05) -.07); 
      d = max(max(bl, br), max(tl, tr));
    } 
    float fill = 1.-(bl.x * bl.y * tr.x * tr.y);
    float stroke = d < wheight && d > -wheight ? 0. : 1.;
    fill = max(fill, stroke);

    gl_FragColor = vec4(vec3(fill), 1.0);
}
