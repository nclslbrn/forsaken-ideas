
precision highp float;

#define MAX_CELL 64.0

uniform vec2 u_resolution;
uniform int u_numCell;
uniform vec4 u_cell[int(MAX_CELL)];

float sdBox(in vec2 p, in vec2 wh) {
    vec2 d = abs(p) - wh;
    return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0);
}
float sdfRep(in float x, in float r) {
    x /= r;
    x -= floor(x) + .5;
    x *= r;
    return x;
}
void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    st *= 1.05;
    //st.x *= u_resolution.x / u_resolution.y;

    vec3 color = vec3(.85);

    for (int i = 0; i <= int(MAX_CELL); i++) {
        if (i < u_numCell) {
            vec2 cellPos = vec2(0.025) + vec2(u_cell[i].xy);
            vec2 cellSiz = vec2(u_cell[i].zw);
            vec2 stToCell = st - cellPos;

            float d = sdBox(abs(stToCell), cellSiz);
            float rep = abs(sdfRep(d, .012) - .024);   
          
            if (abs(st.y - cellPos.y) <= cellSiz.y * .5) {
                if (abs(st.x - cellPos.x) <= cellSiz.x * .5) {
                    if (d < 0.) {
                        color = vec3(
                          d < -0.01 
                            ? rep > 0.024 ? .85 : .25
                            : .25
                        );
                    }
                }
            }
        }
    }

    gl_FragColor = vec4(color, 1.0);
}
