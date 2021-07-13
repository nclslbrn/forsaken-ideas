export default function () {
    const projects = document.querySelectorAll('#projectsList li')
    const projectPaths = Array.from(projects).map((li) => {
        const url = li.firstChild.attributes.href.value
        const folder = url.substring(url.lastIndexOf('/') + 1)
        return folder
    })

    const randomProject =
        projectPaths[Math.floor(projectPaths.length * Math.random())]
    const currentUrl = window.location.href
    const metaOgImage = document.querySelector("meta[property='og:image']")
    const metaTwitterImage = document.querySelector(
        "meta[property='twitter:image']"
    )
    if (metaOgImage !== null && metaTwitterImage !== null && projectPaths) {
        const randomProjectCaptureUrl = `${currentUrl}sketch/${randomProject}/capture.jpg`

        metaOgImage.setAttribute('content', randomProjectCaptureUrl)
        metaTwitterImage.setAttribute('content', randomProjectCaptureUrl)
    }
}
