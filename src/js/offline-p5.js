export default function offlineP5() {
    if (typeof window.p5 == 'undefined') {
        console.log('CDN down or offline browser ?')
        let script = document.createElement('script')
        script.setAttribute('src', '../p5.min.js')

        document.body.appendChild(script)
    }
}
