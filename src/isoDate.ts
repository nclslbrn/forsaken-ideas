const pad = (x: number): String => x < 10 ? "0" + x : String(x)
const isoDate = (): String => {
  const d = new Date()
  return (
    d.getUTCFullYear() + "-" +
    pad(d.getUTCMonth() + 1) + "-" +
    pad(d.getUTCDate())
  )
}

export { isoDate }