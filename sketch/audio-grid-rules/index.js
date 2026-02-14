// import '../full-canvas.css'
// import '../framed-canvas.css'

import './style.css'
import { rect, group, svgDoc, asSvg } from '@thi.ng/geom'
import { FMT_yyyyMMdd_HHmmss } from '@thi.ng/date'

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
    CUSTOM_FORMAT = quantity([50, 50], 'cm'),
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

let seed,
    STATE,
    currNote = 0,
    currArpeggNote = 0,
    isPlaying = false,
    groupedElems = [],
    timeoutID = null,
    arpTimeoutId = null,
    arpSynth = null,
    mainSynths = []

const init = async () => {
    if (!seed) return

    STATE = resolveState({
        width: SIZE[0],
        height: SIZE[1],
        margin: MARGIN,
        seed
    })
    console.log(STATE)
    CANVAS.width = SIZE[0]
    CANVAS.height = SIZE[1]

    const { theme, groupedElems, arpeggioSequence, notes } = STATE

    draw(
        CTX,
        group({}, [
            rect(SIZE, { fill: theme[1][0] }),
            ...groupedElems.map((elems) => group({}, elems))
        ])
    )

    const compressor = AUDIO_CTX.createDynamicsCompressor()
    const masterGain = AUDIO_CTX.createGain()
    // Compressor settings
    compressor.threshold.value = -12
    compressor.knee.value = 50
    compressor.ratio.value = 12
    compressor.attack.value = 0.003
    compressor.release.value = 0.25

    compressor.connect(masterGain)
    masterGain.connect(AUDIO_CTX.destination)

    const arpSynthClass = getSynth(arpeggioSequence[currArpeggNote].synth)
    arpSynth = new arpSynthClass(AUDIO_CTX, masterGain)
    mainSynths = notes.map((n) => {
        if (!n.synth) return
        const Synth = getSynth(n.synth)
        return new Synth(AUDIO_CTX, masterGain)
    })
    // source.connect(AUDIO_CTX.destination)
}

const playArpeggio = () => {
    const { arpeggioSequence } = STATE
    if (!isPlaying || !arpeggioSequence[currArpeggNote].synth) return

    const duration = (arpeggioSequence[currArpeggNote].duration / TEMPO) * 1000

    arpSynth.playNote({
        frequency: arpeggioSequence[currArpeggNote].frequency,
        duration: duration,
        velocity: arpeggioSequence[currArpeggNote].velocity
    })
    clearTimeout(arpTimeoutId)
    // Move to next note
    arpTimeoutId = setTimeout(() => {
        currArpeggNote = (currArpeggNote + 1) % arpeggioSequence.length
        playArpeggio()
    }, duration)
}

const animate = () => {
    const { notes, groupedElems, theme } = STATE
    if (!isPlaying || !notes[currNote].duration || notes.length === 0) return

    // if (currNote === 0)
    playArpeggio()

    const secondsPerBeat = (notes[currNote].duration / TEMPO) * 1000

    if (notes[currNote].synth) {
        mainSynths[currNote].playNote({
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

    timeoutID = setTimeout(function () {
        animate()
    }, secondsPerBeat)
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
// document.getElementById('iconav').style.display = 'none'

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
window.infobox = infobox

ROOT.removeChild(document.getElementById('loading'))
ROOT.appendChild(CANVAS)
ROOT.appendChild(ITER_LIST)
init()
iterMenu(ITER_LIST, STATE)
handleAction()
