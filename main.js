import { bubbleSort } from './algos/bubble.js';
import { quickSort } from './algos/quicksort.js';
import { mergeSort } from './algos/mergesort.js';
import { heapSort } from './algos/heapsort.js';

import { state, wait, render } from './controller.js';

let masterArray = [];
let isRunning = false; 

// Export these so the HTML "onclick" can find them
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
    
    // Start all algorithms simultaneously
    await Promise.all([
        bubbleSort([...masterArray], "bubble-container"),
        quickSort([...masterArray], 0, masterArray.length - 1, "quick-container"),
        mergeSort([...masterArray], 0, masterArray.length - 1, "merge-container"),
        heapSort([...masterArray], "heap-container")
    ]);
    
    isRunning = false;
    document.getElementById('status').innerText = "Status: Finished!";
};

function generateNewArray(size = 50) {
    masterArray = Array.from({length: size}, () => Math.floor(Math.random() * 100));
    render(masterArray, "bubble-container");
    render(masterArray, "quick-container");
    render(masterArray, "merge-container");
    render(masterArray, "heap-container");
}

window.addEventListener('DOMContentLoaded', () => {
    generateNewArray();
});
