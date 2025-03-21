import '../framed-canvas.css'
import infobox from '../../sketch-common/infobox'
import handleAction from '../../sketch-common/handle-action'

import vertSrc from "./glsl/triangles.vert";
import fragSrc from "./glsl/triangles.frag";

import SvgTracer from '../../sketch-common/svg-tracer'
import { fillWithStraightLines } from '../../sketch-common/fillShape'

let traits = {}, svg;

const containerElement = document.getElementById('windowFrame'),
  loader = document.getElementById('loading'),
  canvas = document.createElement("canvas"),
  gl = canvas.getContext("webgl", { preserveDrawingBuffer: true }),
  S = [1122.520, 1587.402],
  { floor, ceil, random } = Math,
  shuffle = (array) => array.sort(() => 0.5 - random())


const splitCell = (cellIdx, isHorizontal, grid) => {
  if (grid[cellIdx] === undefined) return grid;
  const [x, y, w, h] = grid[cellIdx];
  const c = 1 / ceil(1 + random() * 2);
  let splitted = [];
  if (isHorizontal) {
    const ws = shuffle([w * c, w * (1 - c)]);
    splitted = [
      [x - w * 0.5 + ws[0] * 0.5, y, ws[0], h],
      [x + w * 0.5 - ws[1] * 0.5, y, ws[1], h],
    ];
  } else {
    const hs = shuffle([h * c, h * (1 - c)]);
    splitted = [
      [x, y - h * 0.5 + hs[0] * 0.5, w, hs[0]],
      [x, y + h * 0.5 - hs[1] * 0.5, w, hs[1]],
    ];
  }
  grid.splice(cellIdx, 1);
  grid.push(...splitted);
  return grid;
};
const capture = (canvas) => {
  const link = document.createElement("a");
  link.download = `Variationes_in_triangulis__std_III_Nicolas_Lebrun.jpg`;
  link.href = canvas.toDataURL("image/jpg");
  link.click();
};

const createShader = (gl, type, source) => {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error("Shader compile failed:", gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
};

const createProgram = (gl, vertexShader, fragmentShader) => {
  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error("Program link failed:", gl.getProgramInfoLog(program));
    return null;
  }
  return program;
};

const sketch = {
  init: () => {
    const numCell = 1 + ceil(random() * 4);
    let cells = [[0.5, 0.5, 1, 1]];

    for (let i = 0; i < numCell; i++)
      cells = splitCell(floor(random() * cells.length), i % 2 === 0, cells);

    traits = {
      noiseSeed: random() * 999,
      noiseSize: 1 + random(),
      target: [0.5 + random() - 0.5, 0.5 + random() - 0.5],
      numCell,
      cells,
    };
    sketch.render();
  },
  setup: () => {
    if (!gl) {
      console.error("WebGL not supported");
      return;
    }

    canvas.width = S[0];
    canvas.height = S[1];
    gl.viewport(0, 0, canvas.width, canvas.height);

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertSrc),
      fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragSrc),
      program = createProgram(gl, vertexShader, fragmentShader);

    gl.useProgram(program);

    const buffer = gl.createBuffer(),
      verts = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      positionLoc = gl.getAttribLocation(program, "a_position");

    sketch.uResolution = gl.getUniformLocation(program, "u_resolution");
    sketch.uNumCell = gl.getUniformLocation(program, "u_numCell");
    sketch.uCells = gl.getUniformLocation(program, "u_cells");
    sketch.uNoiseSize = gl.getUniformLocation(program, "u_noiseSize");
    sketch.uNoiseSeed = gl.getUniformLocation(program, "u_noiseSeed");
    sketch.uTarget = gl.getUniformLocation(program, "u_target");

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(positionLoc);
    gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);
    gl.disable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    sketch.init();
    gl.clearColor(1, 1, 1, 1);
    sketch.render();
  },
  render: () => {
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform2f(sketch.uResolution, canvas.width, canvas.height);
    gl.uniform1i(sketch.uNumCell, traits.numCell);
    gl.uniform4fv(
      sketch.uCells,
      traits.cells.reduce((s, c) => [...s, ...c], []),
    );
    gl.uniform1f(sketch.uNoiseSize, traits.noiseSize);
    gl.uniform1f(sketch.uNoiseSeed, traits.noiseSeed);
    gl.uniform2f(sketch.uTarget, ...traits.target);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  },
  exportSvg: () => {
    const polygons = [
      ...fillWithStraightLines(canvas, (c) => c < 128, 8, 1),
      ...fillWithStraightLines(canvas, (c) => c < 128, 5, 3)
    ]
    const dpi = 300
    svg = new SvgTracer({
      parentElem: containerElement,
      size: 'A3_portrait',
      dpi
    })
    svg.init()
    polygons.forEach((poly) =>
      svg.path({
        points: poly.map((v) => [
          v[0] / canvas.width * svg.width,
          v[1] / canvas.height * svg.height
        ]),
        stroke: 'black',
        strokeWidth: svg.cmToPixels(.05),
        close: false
      })
    )
  }

};

containerElement.removeChild(loader)
containerElement.appendChild(canvas);
sketch.setup();
sketch.exportSvg();

window.init = sketch.init
window.download = () => svg.export({ name: `Triangles-and-nothing-else-${new Date().toISOString()}` })
window.infobox = infobox
handleAction()
