export default class CanvasPictureSampler {
    constructor() {
        this.canvas = document.createElement('canvas')
        this.canvas.style = `
          display: block;
          width: 80% !important;
          height: auto;
          display: block;
          float: left;
          background: white;`
        document.body.appendChild(this.canvas)
        this.context = false
    }

    load(img, callback) {
        if (undefined !== this.canvas.getContext) {
            this.context = this.canvas.getContext('2d')
            this.canvas.width = 56
            this.canvas.height = 74
            this.context.drawImage(
                img,
                0,
                0,
                this.canvas.width,
                this.canvas.height
            )

            const recontrast = this.boostContrast(
                this.context.getImageData(
                    0,
                    0,
                    this.canvas.width,
                    this.canvas.height
                ),
                50
            )
            this.context.putImageData(recontrast, 0, 0)

            if (callback && 'function' === typeof callback) callback()
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

    boostContrast(imgData, contrast) {
        //input range [-100..100]
        var d = imgData.data
        contrast = contrast / 100 + 1 //convert to decimal & shift range: [0..2]
        var intercept = 128 * (1 - contrast)
        for (var i = 0; i < d.length; i += 4) {
            //r,g,b,a
            d[i] = d[i] * contrast + intercept
            d[i + 1] = d[i + 1] * contrast + intercept
            d[i + 2] = d[i + 2] * contrast + intercept
        }
        return imgData
    }
}
