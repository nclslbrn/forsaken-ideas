import '../framed-canvas.css'
import infobox from '../../sketch-common/infobox'
import handleAction from '../../sketch-common/handle-action'
import modularGrid from './modular-grid'
import { canvasRecorder } from '@thi.ng/dl-asset'
const containerElement = document.getElementById('windowFrame')
const loader = document.getElementById('loading')

let img = new Image(),
    canvas = document.createElement('canvas'),
    ctx = canvas.getContext('2d', { willReadFrequently: true }),
    frameRequest = 0,
    frame = 0,
    recorder = null,
    isRecording = false,
    rects = [],
    rectsSortedCount = [],
    pendingWrites = [],
    minBrightness = 60,
    maxBrightness = 160,
    phase = 'horizontal',
    pix = null,
    imageData = null,
    gridRectIdx = 0,
    gridsCompleted = 0,
    awaitingGridBoundary = false

const capture = (canvas) => {
    const link = document.createElement('a')
    link.download = `ps-${frame}.jpg`
    link.href = canvas.toDataURL('image/jpg')
    link.click()
}
const LINE_WIDTH = 2,
    PIXELS_PER_FRAME = 100

img.src = 'usgs-08hjz7VzB84-unsplash.jpg'
  'usgs-z7UN-MF4y1I-unsplash.jpg'
/*
  'jason-leung-IM0DTKkVMl4-unsplash.jpg'
  'sebastian-schuster-lVVtKvlKetA-unsplash.jpg'
  'martin-sanchez-LkN0Voym3Go-unsplash.jpg'
  'GettyImages-2194275348-e1743046237756.jpg'
  'compagnons-3udo6ejRdww-unsplash.jpg'
  'leandre-c-CtT8eAv6GxA-unsplash.jpg'
  'leandre-c-yjTzXnk8Kzo-unsplash.jpg'
  'nasa-O0dEH-UPj68-unsplash.jpg'
  'jason-leung-exYRCy4aj9E-unsplash.jpg'
  'usgs-ScopIGGJAQ4-unsplash.jpg'
  'usgs-siKUDDi4o64-unsplash.jpg'
 */

const getBrightness = (r, g, b) => (r + g + b) / 3

const sortRegionRows = (pix, { rx, ry, rw, rh }, threshold) => {
    for (let y = ry; y < ry + rh; y++) {
        let sortingStart = -1
        for (let x = rx; x < rx + rw; x++) {
            const idx = (y * canvas.width + x) * 4
            const brightness = getBrightness(
                pix[idx],
                pix[idx + 1],
                pix[idx + 2]
            )
            if (brightness < threshold[1] && sortingStart === -1)
                sortingStart = x
            if (
                (brightness <= threshold[0] || x === rx + rw - 1) &&
                sortingStart !== -1
            ) {
                const closingAtEdge = x === rx + rw - 1 && brightness < threshold[1]
                const len = x - sortingStart + (closingAtEdge ? 1 : 0)
                if (len > 1)
                    sortRow(pix, (y * canvas.width + sortingStart) * 4, len)
                sortingStart = -1
            }
        }
    }
}

const sortRegionCols = (pix, { rx, ry, rw, rh }, threshold) => {
    for (let x = rx; x < rx + rw; x++) {
        let sortingStart = -1
        for (let y = ry; y < ry + rh; y++) {
            const idx = (y * canvas.width + x) * 4
            const brightness = getBrightness(
                pix[idx],
                pix[idx + 1],
                pix[idx + 2]
            )
            if (brightness < threshold[1] && sortingStart === -1)
                sortingStart = y
            if (
                (brightness <= threshold[0] || y === ry + rh - 1) &&
                sortingStart !== -1
            ) {
                const closingAtEdge = y === ry + rh - 1 && brightness < threshold[1]
                const len = y - sortingStart + (closingAtEdge ? 1 : 0)
                if (len > 1)
                    sortColumn(
                        pix,
                        (sortingStart * canvas.width + x) * 4,
                        len,
                        canvas.width
                    )
                sortingStart = -1
            }
        }
    }
}

const sortRow = (pix, startIndex, length) => {
    const row = []

    for (let i = 0; i < length; i++) {
        const idx = startIndex + i * 4
        row.push({
            brightness: getBrightness(pix[idx], pix[idx + 1], pix[idx + 2]),
            colors: [pix[idx], pix[idx + 1], pix[idx + 2], pix[idx + 3]]
        })
    }

    row.sort((a, b) => a.brightness - b.brightness)

    for (let i = 0; i < length; i++) {
        const idx = startIndex + i * 4
        pendingWrites.push({ idx, colors: row[i].colors })
    }

    return pix
}

const sortColumn = (pix, startIndex, length, imageWidth) => {
    const column = []

    for (let i = 0; i < length; i++) {
        const idx = startIndex + i * imageWidth * 4
        column.push({
            brightness: getBrightness(pix[idx], pix[idx + 1], pix[idx + 2]),
            colors: [pix[idx], pix[idx + 1], pix[idx + 2], pix[idx + 3]]
        })
    }

    column.sort((a, b) => a.brightness - b.brightness)

    for (let i = 0; i < length; i++) {
        const idx = startIndex + i * imageWidth * 4
        pendingWrites.push({ idx, colors: column[i].colors })
    }
    return pix
}

const randGrid = () => {
    rects = modularGrid(Math.floor(3 + Math.random() + 4), Math.random).map(
        ([x, y, w, h]) => ({
            rx: x * img.width,
            ry: y * img.height,
            rw: w * img.width,
            rh: h * img.height
        })
    )
    rectsSortedCount = rects.map(() => 0)
}

const flushPendingWrites = (pix) => {
    const n = Math.min(PIXELS_PER_FRAME, pendingWrites.length)
    for (let i = 0; i < n; i++) {
        const { idx, colors } = pendingWrites.shift()
        pix[idx] = colors[0]
        pix[idx + 1] = colors[1]
        pix[idx + 2] = colors[2]
        pix[idx + 3] = colors[3]
    }
}

const drawRects = () => {
    ctx.save()
    ctx.strokeStyle = '#00000022'
    ctx.lineWidth = LINE_WIDTH
    rects.forEach(({ rx, ry, rw, rh }) => {
        ctx.strokeRect(
            rx + LINE_WIDTH / 2,
            ry + LINE_WIDTH / 2,
            rw - LINE_WIDTH / 2,
            rh - LINE_WIDTH / 2
        )
    })
    ctx.restore()
}

const update = () => {
    frameRequest = requestAnimationFrame(update)

    if (pendingWrites.length === 0) {
        if (awaitingGridBoundary) {
            // the previous grid has now been fully sorted AND fully drawn
            awaitingGridBoundary = false
            gridsCompleted++

            if (gridsCompleted === 1) {
                // grid 1 done — start recording before grid 2 begins
                isRecording = true
                startRecording()
            } else if (gridsCompleted === 2) {
                // grid 2 done — stop recording and halt
                if (isRecording) {
                    stopRecording()
                    isRecording = false
                }
                drawRects()
                cancelAnimationFrame(frameRequest)
                return
            }

            randGrid()
            gridRectIdx = 0
        }

        const currRect = rects[gridRectIdx]

        if (minBrightness > 20 && Math.min(...rectsSortedCount) > 2)
            minBrightness -= 1
        if (maxBrightness < 235 && Math.min(...rectsSortedCount) > 2)
            maxBrightness += 1

        if (phase === 'horizontal') {
            sortRegionRows(pix, currRect, [minBrightness, maxBrightness])
            phase = 'vertical'
        } else {
            sortRegionCols(pix, currRect, [minBrightness, maxBrightness])
            phase = 'horizontal'
        }
        rectsSortedCount[gridRectIdx]++

        if (gridRectIdx === rects.length-1) {
            awaitingGridBoundary = true
        }
        console.log(`cell ${gridRectIdx+1}/${rects.length}`)
        gridRectIdx++ //= gridRectIdx === rects.length ? 0 : gridRectIdx + 1
    }

    flushPendingWrites(pix)
    ctx.putImageData(imageData, 0, 0)
    drawRects()
    frame++
}

img.onload = () => {
    canvas.width = img.width
    canvas.height = img.height
    ctx.drawImage(img, 0, 0)
    randGrid()
    if (frameRequest) cancelAnimationFrame(frameRequest)

    imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    pix = imageData.data
    // isRecording = true
    // startRecording()
    update()
}

const startRecording = () => {
    if (!isRecording) return
    recorder = canvasRecorder(
        canvas,
        `pixel-sorting-${new Date().toISOString()}.mp4`,
        {
            mimeType: 'video/webm',
            fps: 10
        }
    )
    recorder.start()
    console.log('%c Record started ', 'background: tomato; color: white')
}

const stopRecording = () => {
    recorder.stop()
    console.log('%c Record stopped ', 'background: limegreen; color: black')
}

window.onkeydown = (e) => {
    switch (e.key.toLowerCase()) {
        case 'r':
            isRecording = !isRecording
            if (isRecording) {
                startRecording()
            } else {
                stopRecording()
            }
            break
        case 'd':
            console.log('pendingWrites.length', pendingWrites.length)
            break
    }
}

containerElement.removeChild(loader)
containerElement.appendChild(canvas)
window.download = () => capture(canvas)
window.infobox = infobox
handleAction()
