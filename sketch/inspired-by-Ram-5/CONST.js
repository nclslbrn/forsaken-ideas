const  COLORS = {
    paper: '#f2ede1',
    stripe: '#3a3a3a88',
    variation: '#cc452d',
    cells: '#e8b4ae'
  },
  STROKE_WEIGHT = 5,
  PRE_CHOICES = {
      numCell: [24, 128],
      numLayer: [2, 6],
      numLinePerLayer: [24, 96],
      ptPerLine: [12, 96],
      amplitude: [0.05, 1.5],
      cellPadding: [-2, 2],
      hasCellContour: 0.5,
      hasStripe: 0.75
  },
  ANGLES = [0, Math.PI / 2, Math.PI / 4, -Math.PI / 4]
export {
  COLORS,
  STROKE_WEIGHT,
  PRE_CHOICES,
  ANGLES
}
