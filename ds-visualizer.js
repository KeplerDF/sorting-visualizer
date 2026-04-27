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

window.peekDS = () => {
    if (data.length === 0) {
        alert("Structure is empty!");
        return;
    }

    if (data.length >= 10) {
        alert("Stack Overflow!");
        return;
    }
    
    // Highlight the element that would be removed next
    const nodes = document.querySelectorAll('.ds-node');
    const targetIndex = stage.className === 'stack-view' ? nodes.length - 1 : 0;
    
    nodes[targetIndex].style.backgroundColor = 'var(--warning)';
    nodes[targetIndex].style.transform = 'scale(1.1)';
    
    setTimeout(() => {
        nodes[targetIndex].style.backgroundColor = 'var(--primary)';
        nodes[targetIndex].style.transform = 'scale(1)';
    }, 1000);
};