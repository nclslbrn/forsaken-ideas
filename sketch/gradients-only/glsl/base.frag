precision lowp float;

#define MAX_RHOMB 128
#define PI 3.1415926535897

uniform vec2 u_resolution;
uniform float u_time;
uniform int u_rhombNum;
uniform vec4 u_rhombus[int(MAX_RHOMB)];
uniform float u_hue;

// By Inigo Quilez
// https://iquilezles.org/articles/distfunctions2d/
float ndot(vec2 a, vec2 b) {
    return a.x * b.x - a.y * b.y;
}
float sdRhombus(vec2 p, vec2 b) {
    p = abs(p);
    float h = clamp(ndot(b - 2.0 * p, b) / dot(b, b), -1.0, 1.0);
    float d = length(p - 0.5 * b * vec2(1.0 - h, 1.0 + h));
    return d * sign(p.x * b.y + p.y * b.x - b.x * b.y);
}
//  Function from Iñigo Quiles
//  https://www.shadertoy.com/view/MsS3Wc
vec3 hsb2rgb(in vec3 c) {
    vec3 rgb = clamp(abs(mod(c.x * 6.0 + vec3(0.0, 4.0, 2.0),
                    6.0) - 3.0) - 1.0,
            0.0,
            1.0);
    rgb = rgb * rgb * (3.0 - 2.0 * rgb);
    return c.z * mix(vec3(1.0), rgb, c.y);
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
    st *= 1.5;
  
    float d = 0.;
    for (int i = 0; i <= int(MAX_RHOMB); i++) {
        if (i < u_rhombNum) {
            vec2 rhombPos = vec2(.25) + vec2(u_rhombus[i].xy);
            vec2 rhombSiz = vec2(u_rhombus[i].zw);
            float id = abs(sdfRep(sdRhombus(rhombPos - st, rhombSiz), .18) - .25);
            d = max(d, id);
        }
    }
    vec2 center = vec2(.75);
    vec3 bg = vec3(.9, .89, .91);
    float fill = bl.x * bl.y * tr.x * tr.y;
    float wheight = .2 + mod(u_time, 1.)*.05;
    float stroke = d < wheight && d > -wheight ? 0. : 1.;
    float fade = length(center-st);
    fill = min(fill, stroke);
    vec3 color = hsb2rgb(vec3(
      mod(.1*fade + pow(abs(d),2.) + u_time, 1.), 
      1.-pow(fade, 3.),
      1.-pow(fade, 4.)
      )
    );
    color = mix(bg, color, fill);

    gl_FragColor = vec4(color, 1.0);
}
