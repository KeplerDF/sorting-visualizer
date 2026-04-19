export const state = {
    isPaused: false,
    isResetting: false,
    stepRequested: false,
    delay: 100
};

export const wait = () => {
    return new Promise((resolve) => {
        const check = () => {
            // 1. If we are resetting, kill the promise immediately
            if (state.isResetting) {
                resolve();
                return;
            }

            // 2. If a step was requested, consume it and move forward
            if (state.stepRequested) {
                state.stepRequested = false; // Reset the flag
                resolve(); // This "steps" the algorithm forward one frame
                return;
            }

            // 3. If we are NOT paused, wait the normal delay
            if (!state.isPaused) {
                setTimeout(resolve, state.delay);
            } 
            // 4. If we ARE paused, keep checking for a resume or a step
            else {
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
