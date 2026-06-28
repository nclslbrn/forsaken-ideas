import '../framed-canvas.css'
import infobox from '../../sketch-common/infobox'
import handleAction from '../../sketch-common/handle-action'
import { sum2 } from '@thi.ng/vectors'
const containerElement = document.getElementById('windowFrame')
const loader = document.getElementById('loading')

let img = new Image(),
    canvas = document.createElement('canvas'),
    ctx = canvas.getContext('2d', { willReadFrequently: true }),
    frameRequest = 0,
    frame = 0,
    numFrame = 0

const capture = (canvas) => {
    const link = document.createElement('a')
    link.download = `ps-${frame}.jpg`
    link.href = canvas.toDataURL('image/jpg')
    link.click()
}
// img.src = 'nasa-O0dEH-UPj68-unsplash.jpg'
img.src = 'jason-leung-exYRCy4aj9E-unsplash.jpg'
  // 'usgs-ScopIGGJAQ4-unsplash.jpg'
  // 'usgs-siKUDDi4o64-unsplash.jpg'

const getBrightness = (r, g, b) => (r + g + b) / 3

const sortRegionRows = (pix, rx, ry, rw, rh, threshold) => {
    for (let y = ry; y < ry + rh; y++) {
        let sortingStart = -1
        for (let x = rx; x < rx + rw; x++) {
            const idx = (y * canvas.width + x) * 4
            const brightness = getBrightness(pix[idx], pix[idx + 1], pix[idx + 2])
            if (brightness < threshold[1] && sortingStart === -1) sortingStart = x
            if ((brightness <= threshold[0] || x === rx + rw - 1) && sortingStart !== -1) {
                const len = x - sortingStart
                if (len > 1) sortRow(pix, (y * canvas.width + sortingStart) * 4, len)
                sortingStart = -1
            }
        }
    }
}

const sortRegionCols = (pix, rx, ry, rw, rh, threshold) => {
    for (let x = rx; x < rx + rw; x++) {
        let sortingStart = -1
        for (let y = ry; y < ry + rh; y++) {
            const idx = (y * canvas.width + x) * 4
            const brightness = getBrightness(pix[idx], pix[idx + 1], pix[idx + 2])
            if (brightness < threshold[1] && sortingStart === -1) sortingStart = y
            if ((brightness <= threshold[0] || y === ry + rh - 1) && sortingStart !== -1) {
                const len = y - sortingStart
                if (len > 1) sortColumn(pix, (sortingStart * canvas.width + x) * 4, len, canvas.width)
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
        pix[idx] = row[i].colors[0]
        pix[idx + 1] = row[i].colors[1]
        pix[idx + 2] = row[i].colors[2]
        pix[idx + 3] = row[i].colors[3]
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
        pix[idx] = column[i].colors[0]
        pix[idx + 1] = column[i].colors[1]
        pix[idx + 2] = column[i].colors[2]
        pix[idx + 3] = column[i].colors[3]
    }
    return pix
}

img.onload = () => {
    canvas.width = img.width
    canvas.height = img.height
    numFrame = img.width * img.height
    ctx.drawImage(img, 0, 0)

    if (frameRequest) cancelAnimationFrame(frameRequest)

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const pix = imageData.data

    let phase = 'horizontal'

    const randomRect = () => {
        const w = Math.floor(Math.random() * (canvas.width * 0.4)) + 40
        const h = Math.floor(Math.random() * (canvas.height * 0.4)) + 40
        const x = Math.floor(Math.random() * (canvas.width - w))
        const y = Math.floor(Math.random() * (canvas.height - h))
        return { x, y, w, h }
    }

    const drawMarker = (rect, currentPhase) => {
        //ctx.save()
        ctx.lineWidth = 2
        ctx.font = 'bold 10px monospace'
        ctx.shadowColor = 'rgba(0,0,0,0.9)'
        ctx.shadowBlur = 4
        ctx.strokeStyle = currentPhase === 'horizontal' ? 'tomato' : 'steelblue'
        ctx.fillStyle = currentPhase === 'horizontal' ? 'tomato' : 'steelblue'
        ctx.strokeRect(rect.x + 0.5, rect.y + 0.5, rect.w - 1, rect.h - 1)
        ctx.textAlign = 'right'
        ctx.fillText(
            `${rect.x}, ${rect.y}`,
            rect.x + rect.w - 4,
            rect.y + rect.h - 6
        )
        //ctx.restore()
    }

    const update = () => {
        const rect = randomRect()
        const currentPhase = phase

        if (phase === 'horizontal') {
            sortRegionRows(pix, rect.x, rect.y, rect.w, rect.h, [40, 180])
            phase = 'vertical'
        } else {
            sortRegionCols(pix, rect.x, rect.y, rect.w, rect.h, [40, 180])
            phase = 'horizontal'
        }

        ctx.putImageData(imageData, 0, 0)
        capture(canvas)
        frame++
        drawMarker(rect, currentPhase)
        frameRequest = requestAnimationFrame(update)
    }

    frameRequest = requestAnimationFrame(update)
}

containerElement.removeChild(loader)
containerElement.appendChild(canvas)
window.download = () => capture(canvas)
window.infobox = infobox
handleAction()
