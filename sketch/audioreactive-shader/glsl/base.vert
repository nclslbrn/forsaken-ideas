precision mediump float;

attribute vec3 a_position;

void main() {
  vec4 positionVec4 = vec4(a_position, 1.0);
  positionVec4.xy = positionVec4.xy * 2.0 - 1.0;
  gl_Position = positionVec4;
}



