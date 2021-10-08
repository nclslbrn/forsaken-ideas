export default class CanvasPictureSampler {
    constructor() {
        this.canvas = document.createElement('canvas')
        this.canvas.style = 'background: white;'

        if (this.canvas.getContext) {
            this.context = this.canvas.getContext('2d')
            document.getElementById('windowFrame').appendChild(this.canvas)
        } else {
            console.error("Sorry, we can't setup canvas context.")
        }
    }

    load(img) {
        //document.getElementById('windowFrame').appendChild(img)
        this.context.drawImage(img, 0, 0, img.width, img.height)
        this.canvas.width = img.width
        this.canvas.height = img.height

        console.log(
            'Image loaded, it has ',
            img.width,
            ' pixels of width and ',
            img.height,
            ' pixels of height.'
        )
    }

    getColor(x, y) {
        const rgba = this.context.getImageData(x, y, 1, 1).data
        return [rgba[0], rgba[1], rgba[2]]
    }
}
