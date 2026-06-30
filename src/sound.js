let audioCtx = null;
let bgmInterval = null;

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioCtx;
}

/**
 * Plays a quick synthesized retro sound effect
 */
function playTone(startFreq, endFreq, duration, type = 'square') {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = type;
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.frequency.setValueAtTime(startFreq, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(endFreq, ctx.currentTime + duration);
    
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  } catch (error) {
    console.warn("Audio playback blocked or unsupported:", error);
  }
}

export const SOUNDS = {
  hit: () => playTone(150, 600, 0.08, 'triangle'),
  hurt: () => playTone(300, 60, 0.15, 'sawtooth'),
  success: () => {
    playTone(300, 900, 0.1, 'square');
    setTimeout(() => playTone(450, 1200, 0.15, 'square'), 70);
  },
  coin: () => playTone(880, 1500, 0.08, 'square'),

  // 🎵 New Expanded 8-Bit Polyphonic Sequencer
  startBGM: () => {
    if (bgmInterval) return;

    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    // 🎹 An iconic 8-note minor/modal progression loop
    // Index:      0    1    2    3    4    5    6    7
    const bass = [110, 110, 130, 146, 165, 146, 130, 123]; // A2 -> C3 -> D3 -> E3 driving bass
    const melody = [440, 494, 523, 587, 659, 587, 523, 494]; // A4 -> B4 -> C5 -> D5 peak melody
    const harmony = [220, 261, 293, 329, 392, 329, 261, 246]; // A3 standard background padding

    let step = 0;

    bgmInterval = setInterval(() => {
      try {
        const now = audioCtx.currentTime;
        const currentStep = step % 8; // Loops perfectly every 8 beats

        // --- 1. BASS SECTION (Triangle wave for thick low-end) ---
        const oscBass = audioCtx.createOscillator();
        const gainBass = audioCtx.createGain();
        oscBass.type = 'triangle';
        // Give the bass a slight alternating octave skip on every other step for rhythm
        const baseFreq = bass[currentStep];
        oscBass.frequency.setValueAtTime(step % 2 === 0 ? baseFreq : baseFreq * 2, now);
        gainBass.gain.setValueAtTime(0.06, now); // Bass can be slightly louder since triangle is soft
        gainBass.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
        oscBass.connect(gainBass);
        gainBass.connect(audioCtx.destination);
        oscBass.start(now);
        oscBass.stop(now + 0.22);

        // --- 2. HARMONY SECTION (Soft Triangle/Sine pad) ---
        const oscHarm = audioCtx.createOscillator();
        const gainHarm = audioCtx.createGain();
        oscHarm.type = 'triangle';
        oscHarm.frequency.setValueAtTime(harmony[currentStep], now);
        gainHarm.gain.setValueAtTime(0.03, now); // Gentle background fill
        gainHarm.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
        oscHarm.connect(gainHarm);
        gainHarm.connect(audioCtx.destination);
        oscHarm.start(now);
        oscHarm.stop(now + 0.22);

        // --- 3. MELODY SECTION (Classic 8-bit Square Wave) ---
        // Let's make the melody play mostly on downbeats or syncopated intervals so it breathes
        if (step % 2 === 0 || currentStep === 3 || currentStep === 7) {
          const oscMel = audioCtx.createOscillator();
          const gainMel = audioCtx.createGain();
          oscMel.type = 'square';
          oscMel.frequency.setValueAtTime(melody[currentStep], now);
          gainMel.gain.setValueAtTime(0.02, now); // Kept lower because square waves pierce through armor
          gainMel.gain.exponentialRampToValueAtTime(0.001, now + 0.20);
          oscMel.connect(gainMel);
          gainMel.connect(audioCtx.destination);
          oscMel.start(now);
          oscMel.stop(now + 0.20);
        }

        step++;
      } catch (e) {
        console.log("BGM playback blocked or interrupted:", e);
      }
    }, 220); // Balanced speed (~135 BPM driving pace)
  },

  stopBGM: () => {
    if (bgmInterval) {
      clearInterval(bgmInterval);
      bgmInterval = null;
    }
  }
};