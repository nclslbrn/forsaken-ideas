const { PI } = Math

const COLORS = {
    paper: '#f2ede1',
    stripe: '#555',
    variation: '#cc452d',
    cells: '#e8b4ae'
  },
  STROKE_WEIGHT = 3,
  PRE_CHOICES = {
    sparse:  {
      numCell: [28, 56],
      numLayer: [2, 3],
      numLinePerLayer: [32, 54],
      ptPerLine: [72, 96],
      amplitude: [0.05, .35],
      cellPadding: [-1, 2],
      hasStripe: 0.66,
      weight: 4
    },
    airy: {
      numCell: [64, 192],
      numLayer: [2, 3],
      numLinePerLayer: [72, 116],
      ptPerLine: [16, 48],
      amplitude: [0.5, 1.2],
      cellPadding: [-1, 2],
      hasStripe: 0.5,
      weight: 3
    },
    rich: {
      numCell: [128, 259],
      numLayer: [2, 5],
      numLinePerLayer: [96, 156],
      ptPerLine: [24, 48],
      amplitude: [0.5, 1.5],
      cellPadding: [-1, 2],
      hasStripe: 0.5,
      weight: 2
    },
    dense: {
      numCell: [96, 128],
      numLayer: [2, 5],
      numLinePerLayer: [96, 128],
      ptPerLine: [8, 16],
      amplitude: [0.5, 2.5],
      cellPadding: [-1, 2],
      hasStripe: 0.66,
      weight: 1.5
    }
  },
  ANGLES = Array.from(Array(16)).map((_, i) => i/8 * PI)


export {
  COLORS,
  STROKE_WEIGHT,
  PRE_CHOICES,
  ANGLES
}
