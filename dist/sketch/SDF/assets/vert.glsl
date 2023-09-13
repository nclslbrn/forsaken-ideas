// vert file and comments from adam ferriss
// https://github.com/aferriss/p5jsShaderExamples

// These are necessary definitions that let you graphics card know how to render the shader
#ifdef GL_ES
precision mediump float;
#endif

attribute vec3 aPosition;

// Always include this to get the position of the pixel
void main(){
  
  // copy the position data into a vec4, using 1.0 as the w component
  vec4 positionVec4=vec4(aPosition,1.);
  // scale the rect by two, and move it to the center of the screen
  // if we don't do this, it will appear with its bottom left corner in the center of the sketch
  // try commenting this line out to see what happens
  positionVec4.xy=positionVec4.xy*2.-1.;
  // Send the vertex information on to the fragment shader
  gl_Position=positionVec4;
}

