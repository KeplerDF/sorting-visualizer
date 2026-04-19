export const state = {
    isPaused: false,
    stepRequested: false,
    delay: 100
};

export async function wait() {
    const speedInput = document.getElementById('speed');
    const speed = speedInput ? speedInput.value : 100;
    
    while (state.isPaused && !state.stepRequested) {
        await new Promise(r => setTimeout(r, 50));
    }
    state.stepRequested = false; 
    await new Promise(r => setTimeout(r, 501 - speed));
}

export function render(array, containerId, activeIndices = []) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = '';
    array.forEach((val, idx) => {
        const bar = document.createElement('div');
        bar.className = 'bar';
        
        // Use the percentage height
        bar.style.height = `${val}%`;
        
        // Highlight logic
        if (activeIndices.includes(idx)) {
            bar.style.backgroundColor = "#e74c3c"; // Red for active
        } else {
            bar.style.backgroundColor = "#3498db"; // Blue for static
        }
        
        container.appendChild(bar);
    });
}
