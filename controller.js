export const state = {
    delay: 100,
    isPaused: false,
    isResetting: false,
    stepCount: 0,
    stats: {
        bubble: { comps: 0, swaps: 0 },
        quick: { comps: 0, swaps: 0 },
        merge: { comps: 0, swaps: 0 },
        heap: { comps: 0, swaps: 0 }
    }
};

export const wait = (localStepTracker) => {
    return new Promise((resolve) => {
        const check = () => {
            if (state.isResetting) {
                resolve();
                return;
            }

            // If the global count is higher than where this specific algo is, STEP!
            if (state.isPaused && state.stepCount > localStepTracker.count) {
                localStepTracker.count++; 
                resolve();
                return;
            }

            if (!state.isPaused) {
                // Sync the local tracker to global so it doesn't "jump" when unpaused
                localStepTracker.count = state.stepCount; 
                setTimeout(resolve, state.delay);
            } else {
                requestAnimationFrame(check);
            }
        };
        check();
    });
};

export function render(array, containerId, activeIndices = [], isFinished = false) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = '';
    array.forEach((val, idx) => {
        const bar = document.createElement('div');
        bar.className = 'bar';
        bar.style.height = `${val}%`;
        
        if (isFinished) {
            bar.style.backgroundColor = "#2ecc71"; // Solid Green
        } else if (activeIndices.includes(idx)) {
            // Active comparison bars turn Red to stand out
            bar.style.backgroundColor = "#FF0000"; 
        } else {
            // Rainbow effect
            const hue = val * 2.4; 
            bar.style.backgroundColor = `hsl(${hue}, 70%, 50%)`;
        }
        
        container.appendChild(bar);
    });
}

export function updateStats(algo, type) {
    if (type === 'comp') state.stats[algo].comps++;
    if (type === 'swap') state.stats[algo].swaps++;
    
    document.getElementById(`${algo}-comps`).innerText = state.stats[algo].comps;
    document.getElementById(`${algo}-swaps`).innerText = state.stats[algo].swaps;
}

export function resetStats() {
    Object.keys(state.stats).forEach(key => {
        state.stats[key].comps = 0;
        state.stats[key].swaps = 0;
        // Update DOM to 0
        document.getElementById(`${key}-comps`).innerText = 0;
        document.getElementById(`${key}-swaps`).innerText = 0;
    });
}
