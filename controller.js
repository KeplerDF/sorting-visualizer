export const state = {
    isPaused: false,
    isResetting: false,
    stepRequested: false,
    delay: 100
};

export const wait = () => {
    return new Promise((resolve) => {
        const check = () => {
            if (state.isResetting) {
                resolve(); // Resolve immediately so the function can hit the 'return' line
            } else if (!state.isPaused) {
                setTimeout(resolve, state.delay);
            } else {
                requestAnimationFrame(check); // Keep waiting if paused
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
