import { rect, group, svgDoc, polyline } from '@thi.ng/geom'
import { pickRandom, pickRandomKey } from '@thi.ng/random'
import { FMT_yyyyMMdd_HHmmss } from '@thi.ng/date'
import '../framed-canvas.css'
import infobox from '../../sketch-common/infobox'
import handleAction from '../../sketch-common/handle-action'
import { downloadCanvas, downloadWithMime } from '@thi.ng/dl-asset'
import { draw } from '@thi.ng/hiccup-canvas'
import { repeatedly, repeatedly2d } from '@thi.ng/transducers'
import { convert, mul, quantity, NONE, mm, dpi, DIN_A3 } from '@thi.ng/units'
import strangeAttractor from '../../sketch-common/strange-attractors'


const DPI = quantity(96, dpi), // default settings in inkscape
  SIZE = mul(DIN_A3, DPI).deref(),
  MARGIN = convert(mul(quantity(15, mm), DPI), NONE),
  ROOT = document.getElementById('windowFrame'),
  CANVAS = document.createElement('canvas'),
  CTX = CANVAS.getContext('2d'),
  ATTRACT_ENGINE = strangeAttractor(),
  palette = ['tomato', 'steelblue', 'limegreen', 'indigo', 'gold']

let width, height, drawElems, attractor, prtcls, trails

ROOT.appendChild(CANVAS)

const randColor = () => {
  const picked = pickRandom(palette)
  palette.splice(palette.indexOf(picked), 1)
  return picked
}


const init = () => {
  width = SIZE[0] - MARGIN * 2
  height = SIZE[1] - MARGIN * 2
  CANVAS.width = SIZE[0]
  CANVAS.height = SIZE[1]
  // create generative things here
  attractor = pickRandomKey(ATTRACT_ENGINE.attractors)
  ATTRACT_ENGINE.init(attractor)

  prtcls = [...repeatedly2d(
    (x, y) => [(x - 15) / 30, (y - 15) / 30],
    20, 20
  )]
  trails = [...repeatedly((i) => [prtcls[i]], prtcls.length)]

  for (let i = 0; i < 10; i++) {
    for (let j = 0; j < prtcls.length; j++) {
      const pos = ATTRACT_ENGINE.attractors[attractor]({
        x: prtcls[j][0], y: prtcls[j][1]
      })
      trails[j].push([pos.x, pos.y])
      prtcls[j] = [pos.x, pos.y]
    }
  }

  drawElems = [
    rect(SIZE, { fill: Math.random() > 0.5 ? 'white' : 'black' }),
    rect([MARGIN, MARGIN], [width, height], { fill: randColor() }),
    // and place them in a group()
    group(
      { stroke: randColor()},
      [...trails.reduce((acc, line) => 
        [
          ...acc, 
          polyline(line.map((pos) => [
            pos[0] * width / 2 + width / 2,
            pos[1] * height / 2 + height / 2
          ]))
        ], [])
      ]
    )
  ]

  draw(CTX, group({}, drawElems))
}

init()
window.init = init

window['capture'] = () => {
  downloadCanvas(CANVAS, `2024 10 60-${FMT_yyyyMMdd_HHmmss()}`, 'jpeg', 1)
}
window['download'] = () => {
  downloadWithMime(
    `2024 10 60-${FMT_yyyyMMdd_HHmmss()}.svg`,
    asSvg(
      svgDoc(
        {
          width: SIZE[0],
          height: SIZE[1],
          viewBox: `0 0 ${SIZE[0]} ${SIZE[1]}`
        },
        group({}, drawElems)
      )
    )
  )
}

window.infobox = infobox
handleAction()
