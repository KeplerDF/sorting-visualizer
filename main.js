import { bubbleSort } from './algos/bubble.js';
import { quickSort } from './algos/quicksort.js';
import { mergeSort } from './algos/mergesort.js';
import { heapSort } from './algos/heapsort.js';

import { state, wait, render } from './controller.js';
import { toggleMute } from './audio.js';
 
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
    isRunning = true;
    
    generateNewArray();
    
    document.getElementById('status').innerText = "Status: Running";
    
    // Wrapped each call in an anonymous function so it can 
    // trigger the "Green" render as soon as THAT specific one ends.
    await Promise.all([
        bubbleSort([...masterArray], "bubble-container").then(() => 
            render(masterArray, "bubble-container", [], true)),
            
        quickSort([...masterArray], 0, masterArray.length - 1, "quick-container").then(() => 
            render(masterArray, "quick-container", [], true)),
            
        mergeSort([...masterArray], 0, masterArray.length - 1, "merge-container").then(() => 
            render(masterArray, "merge-container", [], true)),
            
        heapSort([...masterArray], "heap-container").then(() => 
            render(masterArray, "heap-container", [], true))
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
    state.isPaused = false;
    state.isResetting = true
    
    // 2. Refresh the UI status
    document.getElementById('status').innerText = "Paused";
    document.getElementById('startBtn').innerText = "Pause";
    document.getElementById('stepBtn').disabled = true;

    // 3. Generate a brand new array and re-render all containers
    // This effectively "clears" the old sorted bars
    generateNewArray(); 
};

window.addEventListener('DOMContentLoaded', () => {
    generateNewArray();
});
