export const state = {
    delay: 100,
    isPaused: false,
    isResetting: false,
    stepCount: 0
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
