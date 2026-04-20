import { state, wait, render, updateStats} from '../controller.js';
import { playNote } from '../audio.js';

export async function heapSort(arr, containerId) {
    let n = arr.length;
    let mySteps = { count: state.stepCount }; 

    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
        await heapify(arr, n, i, containerId, mySteps); // Pass it down
    }
    
    for (let i = n - 1; i > 0; i--) {
        if (state.isResetting) return;
        [arr[0], arr[i]] = [arr[i], arr[0]];
        render(arr, containerId);
        playNote(arr[i], 'sawtooth');
        await heapify(arr, i, 0, containerId, mySteps); // Pass it down
    }
}

export async function heapify(arr, n, i, containerId, mySteps) {
    let largest = i;
    let l = 2 * i + 1;
    let r = 2 * i + 2;

    // Highlight parent and potential children
    render(arr, containerId, [i, l, r]);
    await wait(mySteps);
    
    updateStats('heap', 'comp');
    if (l < n) {
        updateStats('heap', 'comp'); // Comparing parent to left child
        if (arr[l] > arr[largest]) largest = l;
    }
    if (r < n) {
        updateStats('heap', 'comp'); // Comparing parent to right child
        if (arr[r] > arr[largest]) largest = r;
    }

    if (largest !== i) {
        if (state.isResetting) return;
        updateStats('heap', 'swap'); // Move this here
        [arr[i], arr[largest]] = [arr[largest], arr[i]];
        render(arr, containerId, [i, largest]);
        await heapify(arr, n, largest, containerId, mySteps);
    }
}
