precision mediump float;

varying float v_life;


void main() {
    vec3 alive = vec3(.95, .9, .9);
    vec3 dead = vec3(.07, .1, .09);

    gl_FragColor = vec4(mix(dead, alive, v_life), 1.);
}
