const chars = [...'0123456789', ...':/*|&#@$!<>', ...'{}[]+-_^~%?;()']
const duration = 45

export default class GlitchText {
    constructor(property) {
        this.element = property.element
        this.trueText = property.element.getAttribute('data-text') || property.element.innerText || property.element.innerHTML
        this.numChar = this.trueText.length
        this.effect = property.effect
        this.curChar = 0
        this.biteChar = ''
        this.element.setAttribute('data-text', this.trueText)

        for (let i = 0; i < this.numChar; i++) {
            let charAtI = [...this.trueText]
            if (charAtI && charAtI === ' ') {
                this.biteChar += ' '
            } else {
                this.biteChar += chars[Math.floor(Math.random() * chars.length)]
            }
        }
        this.element.innerHTML = this.effect == 'replace' ? this.biteChar : ''
        for (let x = 0; x <= this.numChar; x++) {
            setTimeout(() => {
                if (this.effect === 'add') {
                    this.addChar()
                } else if (this.effect === 'replace') {
                    this.replaceChar()
                }
            }, x * duration)
        }
    }
    replaceChar () {
        let middleStringPart
        if (this.curChar + 1 < this.numChar) {
            middleStringPart = chars[Math.floor(Math.random() * chars.length)]
        } else {
            middleStringPart = ''
        }
        let firstStringPart = this.trueText.substr(0, this.curChar)
        let lastStringPart = this.biteChar.substr(this.curChar, this.numChar)
        this.element.innerHTML =
            firstStringPart + middleStringPart + lastStringPart
        this.element.dataset.text =
            firstStringPart + middleStringPart + lastStringPart
        this.curChar++
    }
    addChar () {
        let middleStringPart
        if (this.curChar + 1 < this.numChar) {
            middleStringPart = chars[Math.floor(Math.random() * chars.length)]
        } else {
            middleStringPart = ''
        }

        let firstStringPart = this.trueText.substr(0, this.curChar)
        this.element.innerHTML = firstStringPart + middleStringPart
        this.element.dataset.text = firstStringPart + middleStringPart
        this.curChar++
    }
}
