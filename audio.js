export const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
let isMuted = false;

export function toggleMute() {
    isMuted = !isMuted;
    return isMuted;
}

export function playNote(value, type = 'sine') {
    if (isMuted) return;

    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.type = type;
    
    // Map value (0-100) to frequency (200Hz to 1000Hz)
    const freq = 200 + (value * 8);
    oscillator.frequency.setValueAtTime(freq, audioCtx.currentTime);

    // Create a "chime" effect with a quick fade-out
    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.1);

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.1);
}
