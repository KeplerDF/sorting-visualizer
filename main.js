import { bubbleSort } from './algos/bubblesort.js';
import { quickSort } from './algos/quicksort.js';
import { mergeSort } from './algos/mergesort.js';
import { heapSort } from './algos/heapsort.js';

import { state, wait } from './controller.js';

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

export function render(array, containerId, activeIndices = []) {
    const container = document.getElementById(containerId);
    if (!container) return; // Safety check
    
    container.innerHTML = '';
    array.forEach((val, idx) => {
        const bar = document.createElement('div');
        bar.className = 'bar';
        bar.style.height = `${val}%`;
        
        if (activeIndices.includes(idx)) {
            bar.style.backgroundColor = "#e74c3c"; // Red highlight
        }
        
        container.appendChild(bar);
    });
}

function generateNewArray(size = 50) {
    masterArray = Array.from({length: size}, () => Math.floor(Math.random() * 100));
    render(masterArray, "bubble-container");
    render(masterArray, "quick-container");
    render(masterArray, "merge-container");
    render(masterArray, "heap-container");
}
