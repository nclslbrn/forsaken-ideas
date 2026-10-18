const COLORS = {
    paper: '#f2ede1',
    stripe: '#555',
    variation: '#cc452d',
    cells: '#e8b4ae'
  },
  STROKE_WEIGHT = 2.5,
  PRE_CHOICES = {
      numCell: [48, 192],
      numLayer: [2, 3],
      numLinePerLayer: [72, 116],
      ptPerLine: [16, 48],
      amplitude: [0.5, 1.2],
      cellPadding: [-2, 2],
      hasCellContour: 0.05,
      hasStripe: 0.75
  },
  ANGLES = [0, Math.PI / 2, Math.PI / 4, -Math.PI / 4]


export {
  COLORS,
  STROKE_WEIGHT,
  PRE_CHOICES,
  ANGLES
}
