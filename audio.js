let audioCtx = null;
let isMuted = false;

export function toggleMute() {
    isMuted = !isMuted;
    return isMuted;
}

export function playNote(value, type = 'sine') {
    if (isMuted) return;
    
    // Create the context ONLY when needed (lazy loading)
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }

    // Wake it up if it was suspended (mobile/browser safety)
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }

    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.type = type;
    const freq = 100 + (value * 5); // Slightly lower range for comfort
    oscillator.frequency.setValueAtTime(freq, audioCtx.currentTime);

    gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.05);

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.05);
}
