// A helper to control animation speed
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
let isPaused = false;
let stepRequested = false;
let masterArray = [];

function togglePlay() {
    isPaused = !isPaused;
    document.getElementById('startBtn').innerText = isPaused ? "Resume" : "Pause";
    document.getElementById('stepBtn').disabled = !isPaused;
    document.getElementById('status').innerText = isPaused ? "Status: Paused" : "Status: Running";
}

function triggerStep() {
    if (isPaused) {
        stepRequested = true;
    }
}

async function startTandemSort() {
    const arraySize = 50;
    const data = Array.from({length: arraySize}, () => Math.floor(Math.random() * 100));

    // Initialize 4 separate instances with the same data
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

async function wait() {
    const speed = document.getElementById('speed').value;
    
    // If paused, stay in this loop
    while (isPaused && !stepRequested) {
        await new Promise(resolve => setTimeout(resolve, 50)); // Check every 50ms
    }
    
    // Reset step flag after one pulse
    stepRequested = false;
    
    // Normal animation delay
    if (!isPaused) {
        await new Promise(resolve => setTimeout(resolve, 501 - speed));
    }
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
    const bubblePromise = bubbleSort([...masterArray], "bubble");
    const quickPromise = quickSort([...masterArray], 0, masterArray.length - 1, "quick");
    const mergePromise = mergeSort([...masterArray], 0, masterArray.length - 1, "merge");
    const heapPromise = heapSort([...masterArray], "heap");

    await Promise.all([bubblePromise, quickPromise, mergePromise, heapPromise]);
}
