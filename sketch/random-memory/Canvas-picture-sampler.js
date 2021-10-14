export default class CanvasPictureSampler {
    constructor() {
        this.canvas = document.createElement('canvas')
        this.canvas.style = 'margin-left: 1em; background: white;'
        this.canvas.setAttribute(
            'onMouseOver',
            "this.style.background='gainsboro'"
        )
        this.canvas.setAttribute('onMouseOut', "this.style.background='white'")

        document.body.appendChild(this.canvas)
        this.context = false
    }

    load(img, callback) {
        if (undefined !== this.canvas.getContext) {
            this.context = this.canvas.getContext('2d')
            this.canvas.width = img.width
            this.canvas.height = img.height
            this.context.drawImage(img, 0, 0)

            /* console.log(
                'Image loaded, it has ',
                img.width,
                ' pixels of width and ',
                img.height,
                ' pixels of height.'
            ) */
            if (callback && 'function' === typeof callback) callback()
            // document.getElementById('windowFrame').appendChild(this.canvas)
        } else {
            console.error("Sorry, we can't setup canvas context.")
            this.context = false
        }
    }

    getColor(x, y) {
        if (this.context) {
            var pixel = this.context.getImageData(x, y, 1, 1)
            var data = pixel.data
            return {
                r: data[0],
                g: data[1],
                b: data[2],
                a: data[3]
            }
        } else {
            console.warn('Canvas context is not accessible.')
        }
    }

    clear() {
        if (this.context) {
            this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)
        }
    }
}
