const exportSVG = (svgContainerId, filename) => {

    let svgFile = null

    const svgContainer = document.getElementById(svgContainerId)
    var data = new Blob([svgContainer.innerHTML], {
        type: 'text/plain'
    });
    if (svgFile !== null) {
        window.URL.revokeObjectURL(svgFile)
    }
    svgFile = window.URL.createObjectURL(data);

    const link = document.createElement("a")
    link.href = svgFile
    link.download = filename
    link.click()
}

export default exportSVG