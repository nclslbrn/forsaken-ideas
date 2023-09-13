import p5 from 'p5'
import infobox from '../../sketch-common/infobox'
import handleAction from '../../sketch-common/handle-action'


let theShader;
let nbFrames = 600;

const sketch = (p5) => {
  p5.preload = () => {
    theShader = p5.loadShader('assets/vert.glsl', 'assets/frag.glsl');
  }

  p5.setup = () => {
    // disables scaling for retina screens which can create inconsistent scaling between displays
    p5.pixelDensity(1);
    p5.createCanvas(window.innerWidth, window.innerHeight, p5.WEBGL);
  }

  p5.draw = () => {
    // shader() sets the active shader with our shader
    p5.shader(theShader);

    // here we're using setUniform() to send our uniform values to the shader
    theShader.setUniform("u_resolution", [p5.width, p5.height]);
    theShader.setUniform("u_time", (p5.frameCount % nbFrames) / nbFrames);
    theShader.setUniform("u_mouse", [p5.mouseX, p5.map(p5.mouseY, 0, p5.height, p5.height, 0)]);
    // rect gives us some geometry on the screen
    p5.rect(0, 0, p5.width, p5.height);
  }

  p5.keyPressed = (key) => {
    if (key == 'p') (p5.isLooping()) ? p5.noLoop() : p5.loop();
    if (key === 's') p5.saveGif("genuary2.gif", nbFrames, { delay: (p5.frameCount % nbFrames), units: 'frames' });
  }

  sketch.initSketch = () => p5.redraw()
  sketch.exportJPG = () => p5.save('SDF')
}

const windowFrame = document.getElementById('windowFrame')
const loader = document.getElementById('loading')

new p5(sketch, windowFrame)
windowFrame.removeChild(loader)
window.init = sketch.initSketch
window.export_JPG = sketch.exportJPG
window.infobox = infobox
handleAction()
