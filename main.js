import { bubbleSort } from './algos/bubblesort.js';
import { quickSort } from './algos/quicksort.js';
import { mergeSort } from './algos/mergesort.js';
import { heapSort } from './algos/heapsort.js';

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
let masterArray = [];
let isRunning = false;

function togglePlay() {
    isPaused = !isPaused;
    document.getElementById('startBtn').innerText = isPaused ? "Resume" : "Pause";
    document.getElementById('stepBtn').disabled = !isPaused;
    document.getElementById('status').innerText = isPaused ? "Status: Paused" : "Status: Running";
}

async function startTandemSort() {
    const arraySize = 50;
    const data = Array.from({length: arraySize}, () => Math.floor(Math.random() * 100));

    const p1 = bubbleSort([...data], "canvas1");
    const p2 = quickSort([...data], "canvas2");
    const p3 = mergeSort([...data], "canvas3");
    const p4 = heapSort([...data], "canvas4");

    // Run them all simultaneously
    await Promise.all([p1, p2, p3, p4]);
    alert("All races finished!");
}

function render(array, containerId, activeIndices = []) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    array.forEach((val, idx) => {
        const bar = document.createElement('div');
        bar.className = 'bar';
        bar.style.height = `${val}%`;
        
        // Highlight active comparisons
        if (activeIndices.includes(idx)) {
            bar.style.backgroundColor = "#e74c3c"; // Red
        }
        
        container.appendChild(bar);
    });
}

function generateNewArray(size = 50) {
    masterArray = Array.from({length: size}, () => Math.floor(Math.random() * 100));
    // Render initial state for all 4 containers
    render(masterArray, "bubble-container");
    render(masterArray, "quick-container");
    render(masterArray, "merge-container");
    render(masterArray, "heap-container");
}

async function startTandemRace() {
    // We use spread [...masterArray] to give each function a unique copy
    const bubblePromise = bubbleSort([...masterArray], "bubble-container");
    const quickPromise = quickSort([...masterArray], 0, masterArray.length - 1, "quick-container");
    const mergePromise = mergeSort([...masterArray], 0, masterArray.length - 1, "merge-container");
    const heapPromise = heapSort([...masterArray], "heap-container");

    await Promise.all([bubblePromise, quickPromise, mergePromise, heapPromise]);
}

async function startRace() {
    if (isRunning) return; // Prevent double starts
    isRunning = true;
    
    // Reset UI and data
    generateNewArray();
    
    // Start the algorithms...
    await startTandemRace();
    
    isRunning = false;
    document.getElementById('status').innerText = "Status: Finished!";
}
