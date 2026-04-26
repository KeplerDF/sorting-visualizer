const stage = document.getElementById('visual-stage');
const input = document.getElementById('ds-input');
let data = [];

function renderDS(mode) {
    stage.innerHTML = '';
    stage.className = mode === 'stack' ? 'stack-view' : 'queue-view';
    
    data.forEach(val => {
        const node = document.createElement('div');
        node.className = 'ds-node';
        node.innerText = val;
        stage.appendChild(node);
    });
}

// STACK LOGIC
window.pushStack = () => {
    if (!input.value) return;
    data.push(input.value);
    input.value = '';
    renderDS('stack');
};

window.popStack = () => {
    data.pop();
    renderDS('stack');
};

// QUEUE LOGIC
window.enqueue = () => {
    if (!input.value) return;
    data.push(input.value);
    input.value = '';
    renderDS('queue');
};

window.dequeue = () => {
    data.shift(); // Remove from front
    renderDS('queue');
};