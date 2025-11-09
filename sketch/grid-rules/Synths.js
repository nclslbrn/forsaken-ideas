/**
 * FM and PWM Oscillator Classes with playNote method
 */

// ============================================
// FM OSCILLATOR CLASS
// ============================================

class FMOscillator {
    constructor(audioContext, output) {
        this.ctx = audioContext
        this.output = output
        // Default parameters
        this.modulatorRatio = 2 // Modulator/carrier ratio
        this.modulationIndex = 3 // Modulation depth
        this.waveform = 'sine'
        this.activeNotes = new Map()
    }

    /**
     * Play a note with frequency modulation
     * @param {number} frequency - Note frequency in Hz
     * @param {number} duration - Duration in seconds
     * @param {number} velocity - Velocity (0.0 to 1.0)
     */
    playNote({ frequency, duration = 1.0, velocity = 0.8 }) {
        const now = this.ctx.currentTime

        // Create oscillators
        const carrier = this.ctx.createOscillator()
        const modulator = this.ctx.createOscillator()
        const modulationGain = this.ctx.createGain()
        const noteGain = this.ctx.createGain()

        // Configuration
        carrier.frequency.value = frequency
        carrier.type = this.waveform

        modulator.frequency.value = frequency * this.modulatorRatio
        modulator.type = this.waveform

        modulationGain.gain.value =
            frequency * this.modulatorRatio * this.modulationIndex

        // ADSR envelope
        noteGain.gain.value = 0
        const attack = 0.01
        const decay = 0.1
        const sustain = velocity * 0.7
        const release = 0.3

        noteGain.gain.linearRampToValueAtTime(velocity, now + attack)
        noteGain.gain.linearRampToValueAtTime(sustain, now + attack + decay)
        noteGain.gain.setValueAtTime(sustain, now + duration - release)
        noteGain.gain.linearRampToValueAtTime(0, now + duration)

        // Connections
        modulator.connect(modulationGain)
        modulationGain.connect(carrier.frequency)
        carrier.connect(noteGain)
        noteGain.connect(this.output)

        // Start
        carrier.start(now)
        modulator.start(now)
        carrier.stop(now + duration)
        modulator.stop(now + duration)

        // Store for reference
        const noteId = Date.now() + Math.random()
        this.activeNotes.set(noteId, { carrier, modulator, noteGain })

        // Cleanup
        setTimeout(
            () => {
                this.activeNotes.delete(noteId)
            },
            duration * 1000 + 100
        )

        return noteId
    }

    /**
     * Set modulation ratio
     */
    setModulatorRatio(ratio) {
        this.modulatorRatio = ratio
        return this
    }

    /**
     * Set modulation index
     */
    setModulationIndex(index) {
        this.modulationIndex = index
        return this
    }

    /**
     * Set waveform type
     */
    setWaveform(type) {
        this.waveform = type
        return this
    }

    /**
     * Set master volume
     */
    setVolume(volume) {
        this.output.gain.value = volume
        return this
    }
}

// ============================================
// PWM OSCILLATOR CLASS
// ============================================

class PWMOscillator {
    constructor(audioContext, output) {
        this.ctx = audioContext
        this.output = output

        // Default parameters
        this.pulseWidth = 0.5
        this.lfoEnabled = false
        this.lfoRate = 0.5
        this.lfoDepth = 0.3
        this.activeNotes = new Map()
    }

    /**
     * Play a note with pulse width modulation
     * @param {number} frequency - Note frequency in Hz
     * @param {number} duration - Duration in seconds
     * @param {number} velocity - Velocity (0.0 to 1.0)
     */
    playNote({ frequency, duration = 1.0, velocity = 0.8 }) {
        const now = this.ctx.currentTime

        // Two sawtooth oscillators
        const saw1 = this.ctx.createOscillator()
        const saw2 = this.ctx.createOscillator()
        saw1.type = 'sawtooth'
        saw2.type = 'sawtooth'
        saw1.frequency.value = frequency
        saw2.frequency.value = frequency

        // Inverter and delay for PWM
        const inverter = this.ctx.createGain()
        inverter.gain.value = -1

        const delay = this.ctx.createDelay()
        delay.delayTime.value = this.pulseWidth / frequency

        // Mixer
        const mixer = this.ctx.createGain()
        mixer.gain.value = 0.5

        // ADSR envelope
        const noteGain = this.ctx.createGain()
        noteGain.gain.value = 0
        const attack = 0.02
        const decay = 0.15
        const sustain = velocity * 0.7
        const release = 0.2

        noteGain.gain.linearRampToValueAtTime(velocity, now + attack)
        noteGain.gain.linearRampToValueAtTime(sustain, now + attack + decay)
        noteGain.gain.setValueAtTime(sustain, now + duration - release)
        noteGain.gain.linearRampToValueAtTime(0, now + duration)

        // Optional LFO
        let lfo = null
        let lfoGain = null

        if (this.lfoEnabled) {
            lfo = this.ctx.createOscillator()
            lfo.frequency.value = this.lfoRate
            lfo.type = 'sine'

            lfoGain = this.ctx.createGain()
            lfoGain.gain.value = this.lfoDepth / frequency

            lfo.connect(lfoGain)
            lfoGain.connect(delay.delayTime)
            lfo.start(now)
            lfo.stop(now + duration)
        }

        // Connections
        saw1.connect(mixer)
        saw2.connect(delay)
        delay.connect(inverter)
        inverter.connect(mixer)
        mixer.connect(noteGain)
        noteGain.connect(this.output)

        // Start
        saw1.start(now)
        saw2.start(now)
        saw1.stop(now + duration)
        saw2.stop(now + duration)

        const noteId = Date.now() + Math.random()
        this.activeNotes.set(noteId, { saw1, saw2, lfo, noteGain })

        setTimeout(
            () => {
                this.activeNotes.delete(noteId)
            },
            duration * 1000 + 100
        )

        return noteId
    }

    /**
     * Set pulse width
     */
    setPulseWidth(width) {
        this.pulseWidth = Math.max(0.01, Math.min(0.99, width))
        return this
    }

    /**
     * Enable/disable LFO
     */
    enableLFO(enabled = true) {
        this.lfoEnabled = enabled
        return this
    }

    /**
     * Set LFO rate
     */
    setLFORate(rate) {
        this.lfoRate = rate
        return this
    }

    /**
     * Set LFO depth
     */
    setLFODepth(depth) {
        this.lfoDepth = depth
        return this
    }

    /**
     * Set master volume
     */
    setVolume(volume) {
        this.output.gain.value = volume
        return this
    }
}

// ============================================
// ADVANCED PWM OSCILLATOR CLASS
// ============================================

class PWMOscillatorAdvanced {
    constructor(audioContext, output) {
        this.ctx = audioContext
        this.output = output

        // Lowpass filter
        this.filter = this.ctx.createBiquadFilter()
        this.filter.type = 'lowpass'
        this.filter.frequency.value = 2000
        this.filter.Q.value = 1

        this.filter.connect(this.output)
        this.output.connect(this.ctx.destination)

        this.pulseWidth = 0.5
        this.lfoEnabled = true
        this.lfoRate = 0.3
        this.lfoDepth = 0.4
        this.filterEnvAmount = 1000
        this.activeNotes = new Map()
    }

    playNote({ frequency, duration = 1.0, velocity = 0.8 }) {
        const now = this.ctx.currentTime

        const saw1 = this.ctx.createOscillator()
        const saw2 = this.ctx.createOscillator()
        saw1.type = 'sawtooth'
        saw2.type = 'sawtooth'
        saw1.frequency.value = frequency
        saw2.frequency.value = frequency

        const inverter = this.ctx.createGain()
        inverter.gain.value = -1

        const delay = this.ctx.createDelay()
        delay.delayTime.value = this.pulseWidth / frequency

        const mixer = this.ctx.createGain()
        mixer.gain.value = 0.5

        // Amplitude envelope
        const noteGain = this.ctx.createGain()
        noteGain.gain.value = 0
        const attack = 0.02
        const decay = 0.15
        const sustain = velocity * 0.7
        const release = 0.25

        noteGain.gain.linearRampToValueAtTime(velocity, now + attack)
        noteGain.gain.linearRampToValueAtTime(sustain, now + attack + decay)
        noteGain.gain.setValueAtTime(sustain, now + duration - release)
        noteGain.gain.linearRampToValueAtTime(0, now + duration)

        // Filter envelope
        const filterFreq = this.filter.frequency.value
        this.filter.frequency.setValueAtTime(filterFreq, now)
        this.filter.frequency.linearRampToValueAtTime(
            filterFreq + this.filterEnvAmount * velocity,
            now + attack
        )
        this.filter.frequency.exponentialRampToValueAtTime(
            filterFreq,
            now + attack + decay * 2
        )

        // LFO
        if (this.lfoEnabled) {
            const lfo = this.ctx.createOscillator()
            lfo.frequency.value = this.lfoRate
            lfo.type = 'sine'

            const lfoGain = this.ctx.createGain()
            lfoGain.gain.value = this.lfoDepth / frequency

            lfo.connect(lfoGain)
            lfoGain.connect(delay.delayTime)
            lfo.start(now)
            lfo.stop(now + duration)
        }

        // Connections
        saw1.connect(mixer)
        saw2.connect(delay)
        delay.connect(inverter)
        inverter.connect(mixer)
        mixer.connect(noteGain)
        noteGain.connect(this.filter)

        saw1.start(now)
        saw2.start(now)
        saw1.stop(now + duration)
        saw2.stop(now + duration)

        const noteId = Date.now() + Math.random()
        this.activeNotes.set(noteId, { saw1, saw2, noteGain })

        setTimeout(
            () => {
                this.activeNotes.delete(noteId)
            },
            duration * 1000 + 100
        )

        return noteId
    }

    setFilterCutoff(freq) {
        this.filter.frequency.value = freq
        return this
    }

    setFilterResonance(q) {
        this.filter.Q.value = q
        return this
    }

    setFilterEnvAmount(amount) {
        this.filterEnvAmount = amount
        return this
    }

    setPulseWidth(width) {
        this.pulseWidth = Math.max(0.01, Math.min(0.99, width))
        return this
    }

    enableLFO(enabled = true) {
        this.lfoEnabled = enabled
        return this
    }

    setLFORate(rate) {
        this.lfoRate = rate
        return this
    }

    setLFODepth(depth) {
        this.lfoDepth = depth
        return this
    }

    setVolume(volume) {
        this.output.gain.value = volume
        return this
    }
}

// ============================================
// NOISE GENERATOR UTILITY
// ============================================
class NoiseGenerator {
    /**
     * Create a noise buffer
     * @param {AudioContext} ctx
     * @param {string} type - 'white', 'pink', or 'brown'
     * @param {number} duration - Buffer duration in seconds
     */
    static createNoiseBuffer(ctx, type = 'white', duration = 2) {
        const bufferSize = ctx.sampleRate * duration
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
        const output = buffer.getChannelData(0)

        switch (type) {
            case 'white':
                // White noise: equal energy across all frequencies
                for (let i = 0; i < bufferSize; i++) {
                    output[i] = Math.random() * 2 - 1
                }
                break

            case 'pink':
                // Pink noise: 1/f spectrum (more bass)
                let b0 = 0,
                    b1 = 0,
                    b2 = 0,
                    b3 = 0,
                    b4 = 0,
                    b5 = 0,
                    b6 = 0
                for (let i = 0; i < bufferSize; i++) {
                    const white = Math.random() * 2 - 1
                    b0 = 0.99886 * b0 + white * 0.0555179
                    b1 = 0.99332 * b1 + white * 0.0750759
                    b2 = 0.969 * b2 + white * 0.153852
                    b3 = 0.8665 * b3 + white * 0.3104856
                    b4 = 0.55 * b4 + white * 0.5329522
                    b5 = -0.7616 * b5 - white * 0.016898
                    output[i] =
                        b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362
                    output[i] *= 0.11 // Compensate for gain
                    b6 = white * 0.115926
                }
                break

            case 'brown':
                // Brown noise: 1/f² spectrum (even more bass)
                let lastOut = 0.0
                for (let i = 0; i < bufferSize; i++) {
                    const white = Math.random() * 2 - 1
                    output[i] = (lastOut + 0.02 * white) / 1.02
                    lastOut = output[i]
                    output[i] *= 3.5 // Compensate for gain
                }
                break
        }

        return buffer
    }
}

// ============================================
// BASIC NOISE SYNTHESIZER
// ============================================

class NoiseSynth {
    constructor(audioContext, output) {
        this.ctx = audioContext
        this.output = output
        // Filter
        this.filter = this.ctx.createBiquadFilter()
        this.filter.type = 'lowpass'
        this.filter.frequency.value = 2000
        this.filter.Q.value = 1
        this.filter.connect(this.output)

        this.noiseType = 'white'
        this.filterEnvAmount = 2000
        this.activeNotes = new Map()
    }

    /**
     * Play a noise note (frequency controls filter cutoff)
     * @param {number} frequency - Controls filter cutoff frequency
     * @param {number} duration - Duration in seconds
     * @param {number} velocity - Velocity (0.0 to 1.0)
     */
    playNote({ frequency, duration = 1.0, velocity = 0.8 }) {
        const now = this.ctx.currentTime

        // Create noise source
        const noiseBuffer = NoiseGenerator.createNoiseBuffer(
            this.ctx,
            this.noiseType,
            duration + 0.5
        )
        const noiseSource = this.ctx.createBufferSource()
        noiseSource.buffer = noiseBuffer

        // Create per-note filter
        const noteFilter = this.ctx.createBiquadFilter()
        noteFilter.type = this.filter.type
        noteFilter.Q.value = this.filter.Q.value

        // Amplitude envelope
        const noteGain = this.ctx.createGain()
        noteGain.gain.value = 0
        const attack = 0.01
        const decay = 0.1
        const sustain = velocity * 0.6
        const release = 0.2

        noteGain.gain.linearRampToValueAtTime(velocity, now + attack)
        noteGain.gain.linearRampToValueAtTime(sustain, now + attack + decay)
        noteGain.gain.setValueAtTime(sustain, now + duration - release)
        noteGain.gain.linearRampToValueAtTime(0, now + duration)

        // Filter envelope (frequency maps to cutoff)
        const baseFreq = frequency * 2
        noteFilter.frequency.setValueAtTime(baseFreq, now)
        noteFilter.frequency.linearRampToValueAtTime(
            baseFreq + this.filterEnvAmount * velocity,
            now + attack
        )
        noteFilter.frequency.exponentialRampToValueAtTime(
            baseFreq,
            now + attack + decay * 2
        )

        // Connections
        noiseSource.connect(noteFilter)
        noteFilter.connect(noteGain)
        noteGain.connect(this.output)

        noiseSource.start(now)
        noiseSource.stop(now + duration)

        const noteId = Date.now() + Math.random()
        this.activeNotes.set(noteId, { noiseSource, noteFilter, noteGain })

        setTimeout(
            () => {
                this.activeNotes.delete(noteId)
            },
            duration * 1000 + 100
        )

        return noteId
    }

    setNoiseType(type) {
        this.noiseType = type
        return this
    }

    setFilterType(type) {
        this.filter.type = type
        return this
    }

    setFilterCutoff(freq) {
        this.filter.frequency.value = freq
        return this
    }

    setFilterResonance(q) {
        this.filter.Q.value = q
        return this
    }

    setFilterEnvAmount(amount) {
        this.filterEnvAmount = amount
        return this
    }

    setVolume(volume) {
        this.output.gain.value = volume
        return this
    }
}

// ============================================
// GRANULAR NOISE SYNTHESIZER
// ============================================

class GranularNoiseSynth {
    constructor(audioContext, output) {
        this.ctx = audioContext
        this.output = output

        this.noiseType = 'white'
        this.grainSize = 0.05 // Grain duration in seconds
        this.grainDensity = 20 // Grains per second
        this.filterFreq = 1000
        this.filterQ = 5
        this.activeNotes = new Map()
    }

    /**
     * Play granular noise (creates rhythmic texture)
     * @param {number} frequency - Controls grain pitch/filter
     * @param {number} duration - Duration in seconds
     * @param {number} velocity - Velocity (0.0 to 1.0)
     */
    playNote({ frequency, duration = 1.0, velocity = 0.8 }) {
        const now = this.ctx.currentTime
        const grains = []
        const grainInterval = 1 / this.grainDensity
        const numGrains = Math.floor(4 * duration * this.grainDensity)

        for (let i = 0; i < numGrains; i++) {
            const grainTime = now + i * grainInterval

            // Create grain
            const noiseBuffer = NoiseGenerator.createNoiseBuffer(
                this.ctx,
                this.noiseType,
                this.grainSize + 0.1
            )
            const grain = this.ctx.createBufferSource()
            grain.buffer = noiseBuffer

            // Filter
            const filter = this.ctx.createBiquadFilter()
            filter.type = 'bandpass'
            filter.frequency.value = frequency * (0.8 + Math.random() * 0.4)
            filter.Q.value = this.filterQ

            // Grain envelope
            const grainGain = this.ctx.createGain()
            grainGain.gain.value = 0
            grainGain.gain.linearRampToValueAtTime(
                velocity * 0.5,
                grainTime + this.grainSize * 0.1
            )
            grainGain.gain.linearRampToValueAtTime(
                0,
                grainTime + this.grainSize
            )

            // Connections
            grain.connect(filter)
            filter.connect(grainGain)
            grainGain.connect(this.output)

            grain.start(grainTime)
            grain.stop(grainTime + this.grainSize)

            grains.push({ grain, filter, grainGain })
        }

        const noteId = Date.now() + Math.random()
        this.activeNotes.set(noteId, grains)

        setTimeout(
            () => {
                this.activeNotes.delete(noteId)
            },
            duration * 4000 + 100
        )

        return noteId
    }

    setNoiseType(type) {
        this.noiseType = type
        return this
    }

    setGrainSize(size) {
        this.grainSize = Math.max(0.01, Math.min(0.5, size))
        return this
    }

    setGrainDensity(density) {
        this.grainDensity = Math.max(1, Math.min(100, density))
        return this
    }

    setFilterResonance(q) {
        this.filterQ = q
        return this
    }

    setVolume(volume) {
        this.output.gain.value = volume
        return this
    }
}

// ============================================
// PITCHED NOISE SYNTHESIZER (Karplus-Strong inspired)
// ============================================

class PitchedNoiseSynth {
    constructor(audioContext, output) {
        this.ctx = audioContext
        this.output = output

        this.dampening = 0.995 // How quickly the sound decays
        this.activeNotes = new Map()
    }

    /**
     * Play pitched noise (sounds like plucked string or percussion)
     * @param {number} frequency - Note frequency in Hz
     * @param {number} duration - Duration in seconds
     * @param {number} velocity - Velocity (0.0 to 1.0)
     */
    playNote({ frequency, duration = 1.0, velocity = 0.8 }) {
        const now = this.ctx.currentTime

        // Create short burst of noise
        const burstLength = 0.05
        const noiseBuffer = NoiseGenerator.createNoiseBuffer(
            this.ctx,
            'white',
            burstLength
        )
        const noiseSource = this.ctx.createBufferSource()
        noiseSource.buffer = noiseBuffer

        // Comb filter creates pitch
        console.log(frequency)
        const delayTime = 1 / frequency
        const delay = this.ctx.createDelay()
        delay.delayTime.value = delayTime

        const feedback = this.ctx.createGain()
        feedback.gain.value = this.dampening

        // Lowpass for warmth
        const filter = this.ctx.createBiquadFilter()
        filter.type = 'lowpass'
        filter.frequency.value = frequency * 12
        filter.Q.value = 1

        // Envelope
        const noteGain = this.ctx.createGain()
        noteGain.gain.value = velocity
        noteGain.gain.exponentialRampToValueAtTime(0.01, now + duration)

        // Connections (feedback loop)
        noiseSource.connect(delay)
        delay.connect(filter)
        filter.connect(feedback)
        feedback.connect(delay) // Feedback loop
        filter.connect(noteGain)
        noteGain.connect(this.output)

        noiseSource.start(now)
        noiseSource.stop(now + burstLength)

        const noteId = Date.now() + Math.random()
        this.activeNotes.set(noteId, {
            noiseSource,
            delay,
            feedback,
            filter,
            noteGain
        })

        setTimeout(
            () => {
                this.activeNotes.delete(noteId)
            },
            duration * 1000 + 100
        )

        return noteId
    }

    setDampening(value) {
        this.dampening = Math.max(0.9, Math.min(0.999, value))
        return this
    }

    setVolume(volume) {
        this.output.gain.value = volume
        return this
    }
}

const SYNTH_OPTIONS = [
    'FMOscillator',
    'PWMOscillator',
    'PWMOscillatorAdvanced',
    'NoiseSynth',
    'GranularNoiseSynth'
    // too buggy  'PitchedNoiseSynth'
]

const SYNTHS = [
    FMOscillator,
    PWMOscillator,
    PWMOscillatorAdvanced,
    NoiseSynth,
    GranularNoiseSynth,
    PitchedNoiseSynth
]

const getSynth = (synthName) => {
    const synthIdx = SYNTH_OPTIONS.indexOf(synthName)
    return SYNTHS[synthIdx]
}

export {
    getSynth,
    SYNTHS,
    SYNTH_OPTIONS,
    FMOscillator,
    PWMOscillator,
    PWMOscillatorAdvanced,
    NoiseSynth,
    GranularNoiseSynth,
    PitchedNoiseSynth
}
