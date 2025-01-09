precision mediump float;
varying float v_life;

void main() {
    gl_FragColor = vec4(vec3(v_life), 1.0); // Fade to black as it dies
}
