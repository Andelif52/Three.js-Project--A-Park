// Calm background music generated live with the Web Audio API (no audio files)

const midiToFreq = (note) => 440 * Math.pow(2, (note - 69) / 12);

// Four gentle chords (MIDI note numbers)
const CHORDS = [
    [48, 55, 59, 64], // C major 7
    [45, 52, 55, 60], // A minor 7
    [41, 48, 52, 57], // F major 7
    [43, 50, 55, 62]  // G
];

// Pentatonic scale: every note sounds pleasant over every chord
const MELODY_NOTES = [72, 74, 76, 79, 81, 84];

const BEAT = 0.75;           // seconds per beat (80 beats per minute)
const BEATS_PER_CHORD = 8;   // each chord lasts 6 seconds
const VOLUME = 0.25;


export function setupMusic() {

    let ctx = null;
    let master = null;
    let bus = null;

    let playing = false;
    let timer = null;
    let nextBeatTime = 0;
    let beat = 0;


    // ---------- Build the sound path (runs once, on first M press) ----------

    function init() {
        ctx = new AudioContext();

        master = ctx.createGain();
        master.gain.value = 0;
        master.connect(ctx.destination);

        // Soft, warm tone
        const filter = ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.value = 2500;

        // Echo
        const delay = ctx.createDelay();
        delay.delayTime.value = 0.45;
        const feedback = ctx.createGain();
        feedback.gain.value = 0.3;
        const echoLevel = ctx.createGain();
        echoLevel.gain.value = 0.35;

        bus = ctx.createGain();
        bus.connect(filter);
        filter.connect(master);                 // dry sound
        filter.connect(delay);                  // echo sound
        delay.connect(feedback);
        feedback.connect(delay);
        delay.connect(echoLevel);
        echoLevel.connect(master);
    }


    // ---------- Instruments ----------

    // Soft pad note that fades in and out slowly
    function playPadNote(freq, start, duration) {
        for (const detune of [-4, 4]) {
            const osc = ctx.createOscillator();
            osc.type = "sine";
            osc.frequency.value = freq;
            osc.detune.value = detune;

            const gain = ctx.createGain();
            gain.gain.setValueAtTime(0, start);
            gain.gain.linearRampToValueAtTime(0.035, start + 1.5);
            gain.gain.setValueAtTime(0.035, start + duration - 1.5);
            gain.gain.linearRampToValueAtTime(0, start + duration);

            osc.connect(gain).connect(bus);
            osc.start(start);
            osc.stop(start + duration + 0.1);
        }
    }

    // Music-box note: quick start, slow fade
    function playBell(freq, start) {
        const envelope = ctx.createGain();
        envelope.gain.setValueAtTime(0.0001, start);
        envelope.gain.exponentialRampToValueAtTime(0.09, start + 0.01);
        envelope.gain.exponentialRampToValueAtTime(0.0001, start + 2.2);
        envelope.connect(bus);

        // Main tone + quieter octave above for a bell-like sound
        for (const [multiplier, level] of [[1, 1], [2, 0.25]]) {
            const osc = ctx.createOscillator();
            osc.type = "sine";
            osc.frequency.value = freq * multiplier;

            const oscGain = ctx.createGain();
            oscGain.gain.value = level;

            osc.connect(oscGain).connect(envelope);
            osc.start(start);
            osc.stop(start + 2.3);
        }
    }

    function randomMelodyNote() {
        return MELODY_NOTES[Math.floor(Math.random() * MELODY_NOTES.length)];
    }


    // ---------- What happens on each beat ----------

    function scheduleBeat(b, time) {
        const chord = CHORDS[Math.floor(b / BEATS_PER_CHORD) % CHORDS.length];

        // New chord every 8 beats
        if (b % BEATS_PER_CHORD === 0) {
            for (const note of chord) {
                playPadNote(midiToFreq(note), time, BEATS_PER_CHORD * BEAT + 1.5);
            }
        }

        // Music-box note on some beats
        if (Math.random() < 0.55) {
            playBell(midiToFreq(randomMelodyNote()), time);
        }

        // Occasional note between beats
        if (Math.random() < 0.2) {
            playBell(midiToFreq(randomMelodyNote()), time + BEAT / 2);
        }
    }

    // Schedules any beats coming up in the next 0.3 seconds
    function scheduler() {
        while (nextBeatTime < ctx.currentTime + 0.3) {
            scheduleBeat(beat, nextBeatTime);
            nextBeatTime += BEAT;
            beat++;
        }
    }


    // ---------- On / off with smooth fades ----------

    function toggle() {
        if (!ctx) init();

        playing = !playing;

        const now = ctx.currentTime;
        master.gain.cancelScheduledValues(now);
        master.gain.setValueAtTime(master.gain.value, now);

        if (playing) {
            ctx.resume();
            if (!timer) {
                nextBeatTime = ctx.currentTime + 0.1;
                timer = setInterval(scheduler, 50);
            }
            master.gain.linearRampToValueAtTime(VOLUME, now + 2);   // 2 s fade in
        } else {
            master.gain.linearRampToValueAtTime(0, now + 1.5);      // 1.5 s fade out
        }
    }

    window.addEventListener("keydown", (e) => {
        if (e.code === "KeyM" && !e.repeat) toggle();
    });

    return { toggle };
}