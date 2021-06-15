import perspective from 'perspective-transform'

export default class Ptransform {
    constructor(squeeze_y = 0.45, perspective_x = 0.75) {
        this.squeeze_y = squeeze_y
        this.perspective_x = perspective_x
    }
    init(width, height) {
        this.pad_x = (width - width * this.perspective_x) / 2
        this.pad_y = (height - height * this.squeeze_y) / 2
        this.srcCorners = [0, 0, width, 0, width, height, 0, height]
        this.dstCorners = [
            this.pad_x,
            this.pad_y,
            width - this.pad_x,
            this.pad_y,
            width + this.pad_x,
            height - this.pad_y,
            -this.pad_x,
            height - this.pad_y
        ]
        this.do = perspective(this.srcCorners, this.dstCorners)
    }
}
