import { rect, polyline, group, svgDoc, asSvg } from '@thi.ng/geom'
import { pickRandom, weightedRandom } from '@thi.ng/random'
import { FMT_yyyyMMdd_HHmmss } from '@thi.ng/date'
import '../full-canvas.css'
//import '../framed-canvas.css'
import infobox from '../../sketch-common/infobox'
import handleAction from '../../sketch-common/handle-action'
import { downloadCanvas, downloadWithMime } from '@thi.ng/dl-asset'
import { draw } from '@thi.ng/hiccup-canvas'
import { convert, mul, quantity, NONE, mm, dpi, DIN_A3 } from '@thi.ng/units'
import {
    getRandSeed,
    saveSeed,
    cleanSavedSeed
} from '../../sketch-common/random-seed'

// import { scribbleLine } from './scribbleLine'
import { getSynth } from './Synths'
import { iterMenu } from './iter-menu'
import { resolveState } from './state'

const DPI = quantity(96, dpi),
    CUSTOM_FORMAT = quantity(
        [window.innerWidth / 20, window.innerHeight / 20],
        'cm'
    ),
    SIZE = mul(CUSTOM_FORMAT, DPI).deref(),
    MARGIN = convert(mul(quantity(42, mm), DPI), NONE),
    ROOT = document.getElementById('windowFrame'),
    CANVAS = document.createElement('canvas'),
    CTX = CANVAS.getContext('2d'),
    AUDIO_CTX = new AudioContext(),
    AUDIO_OUT = AUDIO_CTX.createGain(),
    ITER_LIST = document.createElement('div'),
    TEMPO = 90

AUDIO_OUT.connect(AUDIO_CTX.destination)
AUDIO_OUT.gain.value = 5

const remap = (n, start1, stop1, start2, stop2) =>
        ((n - start1) / (stop1 - start1)) * (stop2 - start2) + start2,
    { random, floor, ceil, min, max, round, abs } = Math

let seed,
    STATE,
    currNote = 0,
    currArpeggNote = 0,
    isPlaying = false,
    groupedElems = [],
    timeoutID = null,
    arpTimeoutId = null

ROOT.appendChild(CANVAS)

const init = async () => {
    if (!seed) return

    STATE = resolveState({
        width: SIZE[0],
        height: SIZE[1],
        margin: MARGIN,
        seed
    })

    CANVAS.width = SIZE[0]
    CANVAS.height = SIZE[1]

    const { theme, groupedElems } = STATE

    draw(
        CTX,
        group({}, [
            rect(SIZE, { fill: theme[1][0] }),
            ...groupedElems.map((elems) => group({}, elems))
        ])
    )
}

const playArpeggio = () => {
    const { arpeggioSequence } = STATE
    if (!isPlaying || !arpeggioSequence[currArpeggNote].synth) return

    const Synth = getSynth(arpeggioSequence[currArpeggNote].synth)
    const osc = new Synth(AUDIO_CTX, AUDIO_OUT)
    const duration = (arpeggioSequence[currArpeggNote].duration / TEMPO) * 1000
    console.log(duration, 'Arpeggio')
    osc.playNote({
        frequency: arpeggioSequence[currArpeggNote].frequency,
        duration: duration * 0.5,
        velocity: arpeggioSequence[currArpeggNote].velocity
    })
    clearTimeout(arpTimeoutId)
    // Move to next note
    arpTimeoutId = setTimeout(() => {
        currArpeggNote = (currArpeggNote + 1) % arpeggioSequence.length
        playArpeggio()
    }, round(duration))
}

const animate = () => {
    const { notes, groupedElems, theme } = STATE
    if (!isPlaying || !notes[currNote].duration || notes.length === 0) return

    // if (currNote === 0)
    //  playArpeggio()

    const secondsPerBeat = notes[currNote].duration / TEMPO
    console.log(secondsPerBeat, notes[currNote].synth)
    if (notes[currNote].synth) {
        const Synth = getSynth(notes[currNote].synth)
        const osc = new Synth(AUDIO_CTX, AUDIO_OUT)
        osc.playNote({
            frequency: notes[currNote].frequency,
            duration: secondsPerBeat,
            velocity: notes[currNote].velocity
        })
    }
    draw(
        CTX,
        group({}, [
            rect(SIZE, { fill: theme[1][0] }),
            ...groupedElems
                .filter((_, n) => n !== currNote)
                .map((elems) => group({}, elems))
        ])
    )
    currNote = (currNote + 1) % notes.length
    clearTimeout(timeoutID)
    timeoutID = setTimeout(
        function () {
            animate()
        },
        round(secondsPerBeat * 1000)
    )
}

CANVAS.onclick = function () {
    isPlaying = !isPlaying
    if (isPlaying) {
        animate()
        AUDIO_CTX.resume()
    } else {
        AUDIO_CTX.suspend()
    }
}
document.getElementById('iconav').style.display = 'none'

window['init'] = () => {
    seed = getRandSeed()
    init()
}

window['exportJPG'] = () => {
    downloadCanvas(CANVAS, `Grid rules-${FMT_yyyyMMdd_HHmmss()}`, 'jpeg', 1)
}
window['exportSVG'] = () => {
    downloadWithMime(
        `Grid rules-${FMT_yyyyMMdd_HHmmss()}.svg`,
        asSvg(
            svgDoc(
                {
                    width: SIZE[0],
                    height: SIZE[1],
                    viewBox: `0 0 ${SIZE[0]} ${SIZE[1]}`
                },
                group({}, [
                    rect(SIZE, { fill: STATE.theme[1][0] }),
                    ...groupedElems.map((elems) => group({}, elems))
                ])
            )
        )
    )
}
document.addEventListener('keypress', (e) => {
    switch (e.key) {
        case 'r':
            seed = getRandSeed()
            init()
            break

        case 'd':
            window.exportJPG()
            break

        case 'v':
            window.exportSVG()
            break

        case 's':
            saveSeed(seed)
            iterMenu(ITER_LIST, STATE)
            break

        case 'c':
            cleanSavedSeed()
            iterMenu(ITER_LIST, STATE)
            break

        case ' ':
            animate()
            break
    }
})
const queryString = window.location.search
const urlParams = new URLSearchParams(queryString)
if (urlParams.has('seed')) {
    seed = urlParams.get('seed')
} else {
    seed = getRandSeed()
}
init()
iterMenu(ITER_LIST, STATE)
window.infobox = infobox
handleAction()
