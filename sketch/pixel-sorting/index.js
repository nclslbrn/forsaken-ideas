import '../framed-canvas.css'
import infobox from '../../sketch-common/infobox'
import handleAction from '../../sketch-common/handle-action'
import { sum2 } from '@thi.ng/vectors'
const containerElement = document.getElementById('windowFrame')
const loader = document.getElementById('loading')

let img = new Image(),
    canvas = document.createElement('canvas'),
    ctx = canvas.getContext('2d', { willReadFrequently: true })

const capture = (canvas) => {
    const link = document.createElement('a')
    link.download = `pixel-sorting.jpg`
    link.href = canvas.toDataURL('image/jpg')
    link.click()
}
img.src = 'assets/nasa-O0dEH-UPj68-unsplash.jpg'

img.onload = () => {
    canvas.width = img.width
    canvas.height = img.height
    ctx.drawImage(img, 0, 0)

    const getBrightness = (r, g, b) => (r + g + b) / 3

    const verticalSorting = (pix, threshold) => {
        for (let x = 0; x < canvas.width; x++) {
            let sortingStart = -1

            for (let y = 0; y < canvas.height; y++) {
                const idx = (y * canvas.width + x) * 4
                const brightness = getBrightness(
                    pix[idx],
                    pix[idx + 1],
                    pix[idx + 2]
                )
                if (brightness < threshold[1] && sortingStart === -1) {
                    sortingStart = y
                }
                if (
                    (brightness <= threshold[0] || y === canvas.height - 1) &&
                    sortingStart !== -1
                ) {
                    const sortingLength = y - sortingStart
                    if (sortingLength > 1) {
                        const startIdx = (sortingStart * canvas.width + x) * 4
                        sortColumn(pix, startIdx, sortingLength, canvas.width)
                    }
                    sortingStart = -1
                }
            }
        }
        return pix
    }
    const horizontalSorting = (pix, threshold) => {
        for (let y = 0; y < canvas.height; y++) {
            let sortingStart = -1

            for (let x = 0; x < canvas.width; x++) {
                const idx = (y * canvas.width + x) * 4
                const brightness = getBrightness(
                    pix[idx],
                    pix[idx + 1],
                    pix[idx + 2]
                )

                if (brightness < threshold[1] && sortingStart === -1) {
                    sortingStart = x
                }

                if (
                    (brightness <= threshold[0] || x === canvas.width - 1) &&
                    sortingStart !== -1
                ) {
                    const sortingLength = x - sortingStart
                    if (sortingLength > 1) {
                        const startIdx = (y * canvas.width + sortingStart) * 4
                        sortRow(pix, startIdx, sortingLength)
                    }
                    sortingStart = -1
                }
            }
        }
        return pix
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


    const main = () => {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        let pix = imageData.data
        pix = horizontalSorting(pix, [60, 190])
        pix = verticalSorting(pix, [60, 240])
        ctx.putImageData(imageData, 0, 0)
    }
  
    main()
}

containerElement.removeChild(loader)
containerElement.appendChild(canvas)
window.download = () => capture(canvas)
window.infobox = infobox
handleAction()
