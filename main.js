import { bubbleSort } from './algos/bubble.js';
import { quickSort } from './algos/quicksort.js';
import { mergeSort } from './algos/mergesort.js';
import { heapSort } from './algos/heapsort.js';

import { state, wait, render } from './controller.js';
import { toggleMute, playNote, playSuccessArpeggio } from './audio.js';
 
let masterArray = [];
let isRunning = false; 

window.handleMute = function() {
    const muted = toggleMute();
    const btn = document.getElementById('muteBtn');
    btn.innerText = muted ? "🔇 Unmute" : "🔊 Mute";
};

export function highlightLine(algoPrefix, lineNumber) {
    const lines = document.querySelectorAll(`#${algoPrefix}-code span`);
    lines.forEach(line => line.classList.remove('line-highlight'));
    const target = document.getElementById(`${algoPrefix}-l${lineNumber}`);
    if (target) target.classList.add('line-highlight');
}

window.togglePlay = function() {
    state.isPaused = !state.isPaused;
    document.getElementById('startBtn').innerText = state.isPaused ? "Resume" : "Pause";
    document.getElementById('stepBtn').disabled = !state.isPaused;
    document.getElementById('status').innerText = state.isPaused ? "Status: Paused" : "Status: Running";
};

window.triggerStep = function() {
    if (state.isPaused) {
        state.stepRequested = true;
    }
};

window.startRace = async function() {
    if (isRunning) return; 
    state.isResetting = false;
    isRunning = true;

    generateNewArray();
    
    document.getElementById('status').innerText = "Status: Running";
    
    await Promise.all([
        // We create the copy HERE
        (async () => {
            const copy = [...masterArray];
            await bubbleSort(copy, "bubble-container");
            // We render the COPY (which is now sorted), not the masterArray
            render(copy, "bubble-container", [], true);
            playSuccessArpeggio('sine');
        })(),
            
        (async () => {
            const copy = [...masterArray];
            await quickSort(copy, 0, copy.length - 1, "quick-container");
            render(copy, "quick-container", [], true);
            playSuccessArpeggio('square');
        })(),
            
        (async () => {
            const copy = [...masterArray];
            await mergeSort(copy, 0, copy.length - 1, "merge-container");
            render(copy, "merge-container", [], true);
            playSuccessArpeggio('triangle');
        })(),
            
        (async () => {
            const copy = [...masterArray];
            await heapSort(copy, "heap-container");
            render(copy, "heap-container", [], true);
            playSuccessArpeggio('sawtooth');
        })()
    ]);
    
    isRunning = false;
    document.getElementById('status').innerText = "Status: Finished!";
};

function generateNewArray(size = 40) {
    console.log("Generating array..."); // This means main.js isn't running
    masterArray = Array.from({length: size}, () => Math.floor(Math.random() * 100));
    render(masterArray, "bubble-container");
    render(masterArray, "quick-container");
    render(masterArray, "merge-container");
    render(masterArray, "heap-container");
}

window.resetRace = function() {
    // 1. Stop any ongoing logic by updating the state
    state.isResetting = true; // This is the "Stop!" signal
    isRunning = false;        // This allows startRace to be called again
    state.isPaused = false;
    
    // 2. Refresh the UI status
    document.getElementById('status').innerText = "Reset Complete";
    document.getElementById('startBtn').innerText = "Pause";
    document.getElementById('stepBtn').disabled = true;

    // 3. Generate a brand new array and re-render all containers
    // This effectively "clears" the old sorted bars
    setTimeout(() => {
        generateNewArray();
        document.getElementById('status').innerText = "Status: Reset Complete";
    }, 50);
};

window.addEventListener('DOMContentLoaded', () => {
    generateNewArray();
});

document.getElementById('speed').addEventListener('input', (e) => {
    const val = parseInt(e.target.value);
   
    state.delay = Math.max(5, 400 - (val * 2)); 
});
