import { state, wait, render } from '../controller.js';

export async function heapSort(arr, containerId) {
    if (state.isResetting) return;
    let n = arr.length;
    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) await heapify(arr, n, i, containerId);
    for (let i = n - 1; i > 0; i--) {
        [arr[0], arr[i]] = [arr[i], arr[0]];
        render(arr, containerId);
        await wait(); 
        await heapify(arr, i, 0, containerId);
    }
}

export async function heapify(arr, n, i, containerId) {
    if (state.isResetting) return;
    let largest = i;
    let l = 2 * i + 1;
    let r = 2 * i + 2;

    // Highlight parent and potential children
    render(arr, containerId, [i, l, r]);
    await wait();

    if (l < n && arr[l] > arr[largest]) largest = l;
    if (r < n && arr[r] > arr[largest]) largest = r;

    if (largest !== i) {
        [arr[i], arr[largest]] = [arr[largest], arr[i]];
        render(arr, containerId, [i, largest]);
        await heapify(arr, n, largest, containerId);
    }
}
